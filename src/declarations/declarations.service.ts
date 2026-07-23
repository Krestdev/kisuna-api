import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import {
  BulkCreateDeclarationLinesDto,
  CreateDeclarationLineDto,
} from './dto/declaration-line.dto';

import {
  Declaration,
  DeclarationLine,
  DeclarationStatus,
  EarningItem,
} from '../../generated/prisma/client';

import {
  CreateEarningItemDto,
  UpdateEarningItemDto,
} from './dto/earning-item.dto';

import {
  CreateDeclarationDto,
  UpdateDeclarationDto,
} from './dto/declaration.dto';
import { FindAllDeclarationsDto } from './dto/find-all-declarations.dto';
import { findAllEarningItems } from './dto/find-all-earningsItems.dro';

@Injectable()
export class DeclarationsService {
  constructor(private databaseService: DatabaseService) {}

  // EarningItem methods

  async createEarningItem(dto: CreateEarningItemDto): Promise<EarningItem> {
    try {
      return this.databaseService.earningItem.create({
        data: {
          name: dto.name,
          category: dto.category,
          isActive: false,
          companyId: dto.companyId,
        },
        include: { company: true },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllEarningItems({
    page = 1,
    limit = 20,
    category,
    companyId,
    isActive,
    name,
  }: findAllEarningItems): Promise<{
    data: EarningItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const data = await this.databaseService.earningItem.findMany({
      where: {
        companyId,
        category,
        isActive,
        name,
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { company: true },
    });

    return {
      data,
      meta: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      },
    };
  }

  async findOneEarningItem(uuid: string): Promise<EarningItem> {
    const item = await this.databaseService.earningItem.findUnique({
      where: { uuid },
    });

    if (!item) throw new NotFoundException('Earning item not found');

    return item;
  }

  async updateEarningItem(
    uuid: string,
    dto: UpdateEarningItemDto,
  ): Promise<EarningItem> {
    const updateEarning = await this.databaseService.earningItem.update({
      where: { uuid },
      data: dto,
    });

    if (!updateEarning) throw new NotFoundException('Earning item not found');

    return updateEarning;
  }

  async deleteEarningItem(uuid: string) {
    const deleteEarning = await this.databaseService.earningItem.update({
      where: { uuid },
      data: { isActive: false },
    });
    if (!deleteEarning) throw new NotFoundException('Earning item not found');
    return deleteEarning;
  }

  // Declaration methods

  async createDeclaration(dto: CreateDeclarationDto) {
    return this.databaseService.declaration.create({
      data: {
        ...dto,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
      },
      include: { company: true },
    });
  }

  async findAllDeclarations({
    page = 1,
    limit = 10,
    companyId,
    type,
    status,
    periodStart,
    periodEnd,
    submittedBy,
    month,
    year,
  }: FindAllDeclarationsDto): Promise<{
    data: Declaration[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const data = await this.databaseService.declaration.findMany({
      where: {
        companyId,
        type,
        status,
        periodStart,
        periodEnd,
        submittedBy,
        AND: [
          {
            periodStart: { gte: new Date(Number(year), Number(month) - 1, 1) },
          },
          { periodEnd: { lte: new Date(Number(year), Number(month), 1) } },
        ],
      },
      skip,
      take: limit,
      orderBy: { periodStart: 'desc' },
      include: {
        company: true,
        lines: {
          include: {
            employee: true,
            earnings: { include: { earningItem: true } },
          },
        },
      },
    });

    return {
      data,
      meta: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      },
    };
  }

  async findOneDeclaration(uuid: string) {
    const declaration = await this.databaseService.declaration.findUnique({
      where: { uuid },
      include: {
        company: true,
        lines: {
          include: {
            employee: true,
            contract: true,
            earnings: { include: { earningItem: true } },
          },
        },
      },
    });

    if (!declaration) throw new NotFoundException('Declaration not found');

    return declaration;
  }

  async updateDeclaration(
    uuid: string,
    dto: UpdateDeclarationDto,
  ): Promise<Declaration> {
    const declaration = await this.findOneDeclaration(uuid);

    if (
      dto.status &&
      declaration.status !== DeclarationStatus.DRAFT &&
      dto.status === DeclarationStatus.DRAFT
    ) {
      throw new BadRequestException('Cannot revert to DRAFT status');
    }

    return this.databaseService.declaration.update({
      where: { uuid },
      data: {
        ...dto,
        ...(dto.status === DeclarationStatus.SUBMITTED &&
          !declaration.submittedAt && { submittedAt: new Date() }),
      },
    });
  }

  async deleteDeclaration(uuid: string): Promise<Declaration> {
    const declaration = await this.findOneDeclaration(uuid);

    if (declaration.status !== DeclarationStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT declarations can be deleted');
    }

    return this.databaseService.declaration.delete({ where: { uuid } });
  }

  // DeclarationLine methods (bulk)

  async createDeclarationLines(
    declarationId: string,
    dto: BulkCreateDeclarationLinesDto,
  ): Promise<DeclarationLine[]> {
    await this.findOneDeclaration(declarationId);

    // Validate all employees exist

    const employeeIds = dto.lines.map((line) => line.employeeId);

    const employees = await this.databaseService.employee.findMany({
      where: { uuid: { in: employeeIds } },
    });

    if (employees.length !== employeeIds.length) {
      const foundIds = employees.map((e) => e.uuid);

      const missingIds = employeeIds.filter((id) => !foundIds.includes(id));

      throw new NotFoundException(
        `Employees not found: ${missingIds.join(', ')}`,
      );
    }

    // Fetch active contracts for employees without contractId

    const linesWithContracts = await Promise.all(
      dto.lines.map(async (line) => {
        if (line.contractId) {
          return line;
        }

        const activeContract = await this.databaseService.contract.findFirst({
          where: {
            employeeId: line.employeeId,

            status: 'ACTIVE',
          },
        });

        if (!activeContract) {
          throw new NotFoundException(
            `No active contract found for employee ${line.employeeId}`,
          );
        }

        return { ...line, contractId: activeContract.uuid };
      }),
    );

    return this.databaseService.$transaction(
      linesWithContracts.map((line) =>
        this.databaseService.declarationLine.create({
          data: {
            declarationId,
            employeeId: line.employeeId,
            contractId: line.contractId!,
            baseSalary: line.baseSalary,
            baseSalaryTaxable: line.baseSalaryTaxable,
            baseSalaryCotisable: line.baseSalaryCotisable,
            earnings: {
              create: line.earnings.map((earning) => ({
                earningItemId: earning.earningItemId,
                amount: earning.amount,
                taxable: earning.taxable,
                cotisable: earning.cotisable,
              })),
            },
          },
          include: {
            employee: true,
            contract: true,
            earnings: { include: { earningItem: true } },
          },
        }),
      ),
    );
  }

  async findDeclarationLines(
    declarationId: string,
  ): Promise<DeclarationLine[]> {
    await this.findOneDeclaration(declarationId);

    return this.databaseService.declarationLine.findMany({
      where: { declarationId },
      include: {
        employee: true,
        contract: true,
        earnings: { include: { earningItem: true } },
      },
    });
  }

  async findOneDeclarationLine(lineId: string): Promise<DeclarationLine> {
    const line = await this.databaseService.declarationLine.findUnique({
      where: { uuid: lineId },
      include: {
        employee: true,
        contract: true,
        earnings: { include: { earningItem: true } },
      },
    });

    if (!line) throw new NotFoundException('Declaration line not found');

    return line;
  }

  async updateDeclarationLine(
    declarationId: string,
    lineId: string,
    dto: CreateDeclarationLineDto,
  ): Promise<DeclarationLine> {
    await this.findOneDeclarationLine(lineId);

    return this.databaseService.$transaction(async (tx) => {
      await tx.declarationEarning.deleteMany({
        where: { declarationLineId: lineId },
      });

      await tx.declarationEarning.deleteMany({
        where: { declarationLineId: lineId },
      });

      return tx.declarationLine.update({
        where: { uuid: lineId },
        data: {
          baseSalary: dto.baseSalary,
          baseSalaryTaxable: dto.baseSalaryTaxable,
          baseSalaryCotisable: dto.baseSalaryCotisable,
          earnings: {
            create: dto.earnings.map((earning) => ({
              earningItemId: earning.earningItemId,
              amount: earning.amount,
              taxable: earning.taxable,
              cotisable: earning.cotisable,
            })),
          },
        },

        include: {
          employee: true,
          contract: true,
          earnings: { include: { earningItem: true } },
        },
      });
    });
  }
}
