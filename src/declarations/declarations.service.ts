import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateEarningItemDto,
  UpdateEarningItemDto,
} from './dto/earning-item.dto';
import {
  CreateDeclarationDto,
  UpdateDeclarationDto,
} from './dto/declaration.dto';
import {
  CreateDeclarationLineDto,
  BulkCreateDeclarationLinesDto,
} from './dto/declaration-line.dto';
import {
  CreateDeclarationEarningDto,
  UpdateDeclarationEarningDto,
} from './dto/declaration-earning.dto';
import {
  DeclarationStatus,
  DeclarationType,
  EarningCategory,
} from '@prisma/client';
import {
  CreateEarningItemDto,
  UpdateEarningItemDto,
} from './dto/earning-item.dto';
import {
  CreateDeclarationDto,
  UpdateDeclarationDto,
} from './dto/declaration.dto';
import {
  CreateDeclarationLineDto,
  BulkCreateDeclarationLinesDto,
} from './dto/declaration-line.dto';
import {
  CreateDeclarationEarningDto,
  UpdateDeclarationEarningDto,
} from './dto/declaration-earning.dto';
import {
  DeclarationStatus,
  DeclarationType,
  EarningCategory,
} from '@prisma/client';

@Injectable()
export class DeclarationsService {
  constructor(private db: DatabaseService) {}

  // EarningItem methods
  async createEarningItem(dto: CreateEarningItemDto) {
    return this.db.earningItem.create({
      data: dto,
      include: { company: true },
    });
  }

  async findAllEarningItems(
    companyId: string,
    category?: EarningCategory,
    isActive?: boolean,
  ) {
  async findAllEarningItems(
    companyId: string,
    category?: EarningCategory,
    isActive?: boolean,
  ) {
    return this.db.earningItem.findMany({
      where: {
        companyId,
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { company: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOneEarningItem(uuid: string) {
    const item = await this.db.earningItem.findUnique({ where: { uuid } });
    if (!item) throw new NotFoundException('Earning item not found');
    return item;
  }

  async updateEarningItem(uuid: string, dto: UpdateEarningItemDto) {
    await this.findOneEarningItem(uuid);
    return this.db.earningItem.update({
      where: { uuid },
      data: dto,
    });
  }

  async deleteEarningItem(uuid: string) {
    await this.findOneEarningItem(uuid);
    return this.db.earningItem.update({
      where: { uuid },
      data: { isActive: false },
    });
  }

  // Declaration methods
  async createDeclaration(dto: CreateDeclarationDto) {
    return this.db.declaration.create({
      data: {
        ...dto,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
      },
      include: { company: true },
    });
  }

  async findAllDeclarations(
    companyId?: string,
    type?: string,
    status?: DeclarationStatus,
  ) {
  async findAllDeclarations(
    companyId?: string,
    type?: string,
    status?: DeclarationStatus,
  ) {
    return this.db.declaration.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(type && { type: type as DeclarationType }),
        ...(status && { status }),
      },
      include: {
        company: true,
        lines: {
          include: {
            employee: true,
            earnings: { include: { earningItem: true } },
          },
        },
      },
      orderBy: { periodStart: 'desc' },
    });
  }

  async findOneDeclaration(uuid: string) {
    const declaration = await this.db.declaration.findUnique({
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

  async updateDeclaration(uuid: string, dto: UpdateDeclarationDto) {
    const declaration = await this.findOneDeclaration(uuid);

    if (
      dto.status &&
      declaration.status !== DeclarationStatus.DRAFT &&
      dto.status === DeclarationStatus.DRAFT
    ) {

    if (
      dto.status &&
      declaration.status !== DeclarationStatus.DRAFT &&
      dto.status === DeclarationStatus.DRAFT
    ) {
      throw new BadRequestException('Cannot revert to DRAFT status');
    }

    return this.db.declaration.update({
      where: { uuid },
      data: {
        ...dto,
        ...(dto.status === DeclarationStatus.SUBMITTED &&
          !declaration.submittedAt && { submittedAt: new Date() }),
        ...(dto.status === DeclarationStatus.SUBMITTED &&
          !declaration.submittedAt && { submittedAt: new Date() }),
      },
    });
  }

  async deleteDeclaration(uuid: string) {
    const declaration = await this.findOneDeclaration(uuid);
    if (declaration.status !== DeclarationStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT declarations can be deleted');
    }
    return this.db.declaration.delete({ where: { uuid } });
  }

  // DeclarationLine methods (bulk)
  async createDeclarationLines(
    declarationId: string,
    dto: BulkCreateDeclarationLinesDto,
  ) {
    await this.findOneDeclaration(declarationId);

    // Validate all employees exist
    const employeeIds = dto.lines.map((line) => line.employeeId);
    const employeeIds = dto.lines.map((line) => line.employeeId);
    const employees = await this.db.employee.findMany({
      where: { uuid: { in: employeeIds } },
      where: { uuid: { in: employeeIds } },
    });


    if (employees.length !== employeeIds.length) {
      const foundIds = employees.map((e) => e.uuid);
      const missingIds = employeeIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Employees not found: ${missingIds.join(', ')}`,
      );
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


        const activeContract = await this.db.contract.findFirst({
          where: {
            employeeId: line.employeeId,
            status: 'ACTIVE',
          },
            status: 'ACTIVE',
          },
        });


        if (!activeContract) {
          throw new NotFoundException(
            `No active contract found for employee ${line.employeeId}`,
          );
          throw new NotFoundException(
            `No active contract found for employee ${line.employeeId}`,
          );
        }


        return { ...line, contractId: activeContract.uuid };
      }),
      }),
    );


    return this.db.$transaction(
      linesWithContracts.map((line) =>
        this.db.declarationLine.create({
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
        }),
      ),
    );
  }

  async findDeclarationLines(declarationId: string) {
    await this.findOneDeclaration(declarationId);
    return this.db.declarationLine.findMany({
      where: { declarationId },
      include: {
        employee: true,
        contract: true,
        earnings: { include: { earningItem: true } },
      },
    });
  }

  async findOneDeclarationLine(lineId: string) {
    const line = await this.db.declarationLine.findUnique({
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
  ) {
  async updateDeclarationLine(
    declarationId: string,
    lineId: string,
    dto: CreateDeclarationLineDto,
  ) {
    await this.findOneDeclarationLine(lineId);

    return this.db.$transaction(async (tx) => {
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

  async deleteDeclarationLine(lineId: string) {
    await this.findOneDeclarationLine(lineId);
    return this.db.declarationLine.delete({ where: { uuid: lineId } });
  }

  // DeclarationEarning methods (granular)
  async createDeclarationEarning(
    lineId: string,
    dto: CreateDeclarationEarningDto,
  ) {
  async createDeclarationEarning(
    lineId: string,
    dto: CreateDeclarationEarningDto,
  ) {
    await this.findOneDeclarationLine(lineId);
    return this.db.declarationEarning.create({
      data: {
        declarationLineId: lineId,
        ...dto,
      },
      include: { earningItem: true },
    });
  }

  async updateDeclarationEarning(
    earningId: string,
    dto: UpdateDeclarationEarningDto,
  ) {
    const earning = await this.db.declarationEarning.findUnique({
      where: { uuid: earningId },
    });
  async updateDeclarationEarning(
    earningId: string,
    dto: UpdateDeclarationEarningDto,
  ) {
    const earning = await this.db.declarationEarning.findUnique({
      where: { uuid: earningId },
    });
    if (!earning) throw new NotFoundException('Declaration earning not found');


    return this.db.declarationEarning.update({
      where: { uuid: earningId },
      data: dto,
      include: { earningItem: true },
    });
  }

  async deleteDeclarationEarning(earningId: string) {
    const earning = await this.db.declarationEarning.findUnique({
      where: { uuid: earningId },
    });
    const earning = await this.db.declarationEarning.findUnique({
      where: { uuid: earningId },
    });
    if (!earning) throw new NotFoundException('Declaration earning not found');


    return this.db.declarationEarning.delete({ where: { uuid: earningId } });
  }
}
