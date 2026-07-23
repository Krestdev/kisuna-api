import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { FindAllContractsDto } from './dto/find-all-contracts.dto';
import { ContractStatus } from '../../generated/prisma/client';

@Injectable()
export class ContractsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(employeeId: string, createContractDto: CreateContractDto) {
    // 1. One Active Contract Rule
    const existingActive = await this.databaseService.contract.findFirst({
      where: { employeeId, status: ContractStatus.ACTIVE },
    });

    if (existingActive) {
      throw new BadRequestException('Employee already has an active contract');
    }
    const { startDate, endDate, companyId, ...rest } = createContractDto;
    return this.databaseService.contract.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        employee: { connect: { uuid: employeeId } },
        company: { connect: { uuid: companyId } },
      },
    });
  }

  async findAll({
    page = 1,
    limit = 10,
    companyId,
    employeeId,
    status,
  }: FindAllContractsDto) {
    const skip = (page - 1) * limit;

    const data = await this.databaseService.contract.findMany({
      where: {
        companyId,
        employeeId,
        status,
      },
      skip,
      take: limit,
      include: {
        employee: { select: { uuid: true, firstName: true, lastName: true } },
        company: { select: { uuid: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
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

  async findOne(uuid: string) {
    const contract = await this.databaseService.contract.findUnique({
      where: { uuid },
      include: {
        employee: true,
        company: true,
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    return contract;
  }

  async update(uuid: string, updateContractDto: UpdateContractDto) {
    const { startDate, endDate, ...rest } = updateContractDto;
    return this.databaseService.contract.update({
      where: { uuid },
      data: {
        ...rest,
        startDate,
        endDate,
      },
    });
  }

  async terminate(uuid: string, terminateDto: TerminateContractDto) {
    const contract = await this.databaseService.contract.findUnique({
      where: { uuid },
      include: {
        employee: true,
        company: true,
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be terminated');
    }

    return this.databaseService.$transaction(async (prisma) => {
      const updatedContract = await prisma.contract.update({
        where: { uuid },
        data: {
          status: ContractStatus.TERMINATED,
          terminationReason: terminateDto.terminationReason,
        },
      });

      // Employee Status Sync

      await prisma.employee.update({
        where: { uuid: contract.employeeId },
        data: { status: 'TERMINATED', isActive: false },
      });

      return updatedContract;
    });
  }

  async renew(uuid: string, createContractDto: CreateContractDto) {
    const oldContract = await this.findOne(uuid);

    return this.databaseService.$transaction(async (prisma) => {
      await prisma.contract.update({
        where: { uuid },
        data: { status: ContractStatus.EXPIRED },
      });

      const { startDate, endDate, companyId, ...rest } = createContractDto;
      const newContract = await prisma.contract.create({
        data: {
          ...rest,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          employee: { connect: { uuid: oldContract.employeeId } },
          company: { connect: { uuid: companyId } },
        },
      });

      return newContract;
    });
  }
}
