import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { CreateEmployeeDto } from './dto/create-employee.dto';

import { UpdateEmployeeDto } from './dto/update-employee.dto';

import { FindAllEmployeesDto } from './dto/find-all-employees.dto';

import * as bcrypt from 'bcrypt';

import { RustfsService } from '../rustfs/rustfs.service';

import {
  Prisma,
  SystemRole,
  DocumentType,
  ContractType,
} from '../../generated/prisma/client';

const DEFAULT_SCHEDULE = {
  shiftStart: '08:00',

  shiftEnd: '17:00',

  workDays: 'MON,TUE,WED,THU,FRI',
};

@Injectable()
export class EmployeesService {
  constructor(
    private readonly databaseService: DatabaseService,

    private readonly rustfs: RustfsService,
  ) {}

  // TODO: refine this function by avoiding unnecessary distruction and optimise data integrity controle block @

  async create(
    createEmployeeDto: CreateEmployeeDto,

    userCompanyId?: string,

    document?: Express.Multer.File,
  ) {
    const {
      birthday,

      hireDate,

      companyId,

      contract,

      contracts,

      idDocumentIssueDate,

      idDocumentExpiryDate,

      email,

      departmentId,

      supervisorId,

      endDate,

      leaveDays,

      phoneNumber,

      EmergencyContactPhone,

      matrimonial_status,

      number_of_children,

      ...rest
    } = createEmployeeDto;

    // For COMPANY_ADMIN, force their company ID

    const finalCompanyId = userCompanyId || companyId;

    // Use contracts if provided, otherwise fall back to contract

    const contractData = contracts || contract;

    return this.databaseService.$transaction(async (prisma) => {
      const employee = await prisma.employee.create({
        data: {
          ...rest,

          phoneNumber,

          EmergencyContactPhone,

          matrimonial_status,

          number_of_children,

          birthday: birthday ? new Date(birthday) : undefined,

          hireDate: hireDate ? new Date(hireDate) : undefined,

          idDocumentIssueDate: idDocumentIssueDate
            ? new Date(idDocumentIssueDate)
            : undefined,

          idDocumentExpiryDate: idDocumentExpiryDate
            ? new Date(idDocumentExpiryDate)
            : undefined,

          ...(finalCompanyId
            ? { company: { connect: { uuid: finalCompanyId } } }
            : {}),

          ...(departmentId
            ? { department: { connect: { uuid: departmentId } } }
            : {}),

          ...(supervisorId
            ? { supervisor: { connect: { uuid: supervisorId } } }
            : {}),

          ...(finalCompanyId
            ? { company: { connect: { uuid: finalCompanyId } } }
            : {}),

          ...(departmentId
            ? { department: { connect: { uuid: departmentId } } }
            : {}),

          ...(supervisorId
            ? { supervisor: { connect: { uuid: supervisorId } } }
            : {}),

          endDate: endDate ? new Date(endDate) : undefined,
        },
      });

      // Auto-create user account with default password

      const defaultPassword = 'Employee@123';

      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await prisma.user.create({
        data: {
          email,

          passwordHash: hashedPassword,

          employeeId: employee.uuid,

          role: 'EMPLOYEE',
        },
      });

      // Create default schedule so employee can check in from day one

      const scheduleStart = hireDate ? new Date(hireDate) : new Date();

      const scheduleEnd = new Date(scheduleStart);

      scheduleEnd.setFullYear(scheduleEnd.getFullYear() + 100);

      await prisma.employeeSchedule.create({
        data: {
          employeeId: employee.uuid,

          startDate: scheduleStart,

          endDate: scheduleEnd,

          shiftStart: DEFAULT_SCHEDULE.shiftStart,

          shiftEnd: DEFAULT_SCHEDULE.shiftEnd,

          workDays: DEFAULT_SCHEDULE.workDays,

          status: 'ACTIVE',
        },
      });

      // Assign position if provided

      // if (positionUuid) {

      //   await prisma.position.update({

      //     where: { uuid: positionUuid },

      //     data: { employeeUuid: employee.uuid },

      //   });

      // }

      // Create contract if provided

      if (
        contractData &&
        finalCompanyId &&
        contractData.startDate &&
        contractData.endDate &&
        contractData.contract_type &&
        contractData.baseSalary
      ) {
        await prisma.contract.create({
          data: {
            employeeId: employee.uuid,

            companyId: finalCompanyId,

            startDate: new Date(contractData.startDate),

            endDate: new Date(contractData.endDate),

            contract_type: contractData.contract_type,

            baseSalary: contractData.baseSalary,

            currency: contractData.currency || 'XAF',
          },
        });
      }

      if (leaveDays !== undefined && leaveDays !== null) {
        await prisma.leaveBalance.create({
          data: {
            employeeId: employee.uuid,

            year: new Date().getFullYear(),

            totalDays: leaveDays,

            remainingDays: leaveDays,

            usedDays: 0,
          },
        });
      }

      if (document) {
        const path = await this.rustfs.uploadFile(
          document,

          `employees/${employee.uuid}`,
        );

        await prisma.employee.update({
          where: { uuid: employee.uuid },

          data: { idDocumentFileUrl: path },
        });

        await prisma.file.create({
          data: {
            file_name: document.originalname,

            document_type: (rest.idDocumentType as DocumentType) ?? 'CNI',

            path,

            expired_date: createEmployeeDto.idDocumentExpiryDate
              ? new Date(createEmployeeDto.idDocumentExpiryDate)
              : null,

            employeeId: employee.uuid,
          },
        });

        employee.idDocumentFileUrl = path;
      }

      return employee;
    });
  }

  async findAll(query: FindAllEmployeesDto, userCompanyId?: string) {
    const {
      page,

      limit,

      companyId,

      departmentId,

      status,

      search,

      includeInactive,

      includeSensitive,

      contractType,
    } = query;

    // For COMPANY_ADMIN, filter by their company

    const finalCompanyId = userCompanyId || companyId?.trim() || undefined;

    // Check if any valid params provided (ignore empty strings)

    const hasParams = !!(
      page ||
      limit ||
      departmentId?.trim() ||
      status?.trim() ||
      search?.trim() ||
      includeInactive ||
      contractType?.trim()
    );

    const returnAll = userCompanyId && !hasParams;

    const actualPage = page || 1;

    const actualLimit = returnAll ? undefined : limit || 10;

    const skip = returnAll ? undefined : (actualPage - 1) * (actualLimit || 10);

    const where: Prisma.EmployeeWhereInput = {
      ...(includeInactive === 'true' ? {} : { isActive: true }),

      ...(finalCompanyId && { companyId: finalCompanyId }),

      ...(status?.trim() && { status }),
    };

    if (contractType?.trim()) {
      where.contracts = {
        some: {
          contract_type: contractType as Prisma.EnumContractTypeFilter,

          status: 'ACTIVE',
        },
      };
    }

    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },

        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const showSensitive = includeSensitive === 'true';

    const queryOptions: Prisma.EmployeeFindManyArgs = {
      where,

      ...(skip !== undefined && { skip }),

      ...(actualLimit !== undefined && { take: actualLimit }),
    };

    if (showSensitive) {
      queryOptions.include = {
        managedDepartments: true,

        contracts: {
          select: {
            baseSalary: true,

            currency: true,

            contract_type: true,

            startDate: true,

            endDate: true,
          },
        },

        user: { select: { uuid: true, email: true, role: true } },
      };
    } else {
      queryOptions.select = {
        uuid: true,

        firstName: true,

        lastName: true,

        gender: true,

        hireDate: true,

        status: true,

        isActive: true,

        companyId: true,

        managedDepartments: true,

        contracts: {
          select: {
            uuid: true,

            contract_type: true,

            startDate: true,

            endDate: true,

            status: true,
          },
        },

        user: {
          select: {
            uuid: true,

            email: true,

            role: true,

            createdAt: true,

            updatedAt: true,
          },
        },
      };
    }

    const companyWhere = finalCompanyId
      ? {
          ...(includeInactive === 'true' ? {} : { isActive: true }),

          companyId: finalCompanyId,
        }
      : null;

    const [data, total, totalInCompany] = await Promise.all([
      this.databaseService.employee.findMany(queryOptions),

      this.databaseService.employee.count({ where }),

      companyWhere
        ? this.databaseService.employee.count({ where: companyWhere })
        : Promise.resolve(undefined),
    ]);

    return {
      data: data.map((emp) => ({
        ...emp,

        role: (emp as { user?: { role?: string } }).user?.role ?? null,
      })),

      meta: {
        total,

        ...(totalInCompany !== undefined && { totalAssigned: totalInCompany }),

        page: actualPage,

        limit: actualLimit || total,

        totalPages: actualLimit ? Math.ceil(total / actualLimit) : 1,
      },
    };
  }

  async findOne(uuid: string, userCompanyId?: string) {
    const where: Prisma.EmployeeWhereInput = { uuid, isActive: true };

    if (userCompanyId) {
      where.companyId = userCompanyId;
    }

    const employee = await this.databaseService.employee.findFirst({
      where,

      include: {
        managedDepartments: true,

        contracts: true,

        user: { select: { uuid: true, email: true, role: true } },
      },
    });

    if (!employee)
      throw new NotFoundException(`Active Employee with ID ${uuid} not found`);

    return {
      ...employee,

      role: employee.user?.role || null,
    };
  }

  async findPersonal(uuid: string, userCompanyId?: string) {
    const where: Prisma.EmployeeWhereInput = { uuid, isActive: true };

    if (userCompanyId) {
      where.companyId = userCompanyId;
    }

    const employee = await this.databaseService.employee.findFirst({
      where,

      include: {
        managedDepartments: true,

        contracts: true,

        user: { select: { uuid: true, email: true, role: true } },
      },
    });

    if (!employee)
      throw new NotFoundException(`Active Employee with ID ${uuid} not found`);

    return {
      ...employee,

      role: employee.user?.role || null,
    };
  }

  async update(
    uuid: string,

    updateEmployeeDto: UpdateEmployeeDto,

    document?: Express.Multer.File,
  ) {
    const existing = await this.databaseService.employee.findUnique({
      where: { uuid },
    });

    if (!existing || !existing.isActive)
      throw new NotFoundException('Active employee not found');

    const {
      birthday,

      hireDate,

      companyId,

      departmentId,

      supervisorId,

      endDate,

      leaveDays: _leaveDays, // eslint-disable-line @typescript-eslint/no-unused-vars

      contract,

      contracts,

      idDocumentIssueDate,

      idDocumentExpiryDate,

      email: _email, // eslint-disable-line @typescript-eslint/no-unused-vars

      ...rest
    } = updateEmployeeDto;

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const validCompanyId =
      companyId && UUID_REGEX.test(companyId) ? companyId : undefined;

    const validDepartmentId =
      departmentId && UUID_REGEX.test(departmentId) ? departmentId : undefined;

    const validSupervisorId =
      supervisorId && UUID_REGEX.test(supervisorId) ? supervisorId : undefined;

    const contractData = contracts || contract;

    return this.databaseService.$transaction(async (prisma) => {
      const updatedEmployee = await prisma.employee.update({
        where: { uuid },

        data: {
          ...rest,

          birthday: birthday ? new Date(birthday) : undefined,

          hireDate: hireDate ? new Date(hireDate) : undefined,

          endDate: endDate ? new Date(endDate) : undefined,

          idDocumentIssueDate: idDocumentIssueDate
            ? new Date(idDocumentIssueDate)
            : undefined,

          idDocumentExpiryDate: idDocumentExpiryDate
            ? new Date(idDocumentExpiryDate)
            : undefined,

          ...(validCompanyId
            ? { company: { connect: { uuid: validCompanyId } } }
            : {}),

          ...(validDepartmentId
            ? { department: { connect: { uuid: validDepartmentId } } }
            : {}),

          ...(validSupervisorId
            ? { supervisor: { connect: { uuid: validSupervisorId } } }
            : {}),
        },
      });

      // Create contract if provided

      const singleContract = (
        Array.isArray(contractData) ? contractData[0] : contractData
      ) as
        | {
            startDate?: string;

            endDate?: string;

            contract_type?: ContractType;

            baseSalary?: number;

            currency?: string;
          }
        | undefined;

      if (
        singleContract?.startDate &&
        singleContract?.endDate &&
        singleContract?.contract_type &&
        singleContract?.baseSalary
      ) {
        if (!updatedEmployee.companyId) {
          throw new NotFoundException(
            'Employee must belong to a company to create a contract',
          );
        }

        const startDate = new Date(singleContract.startDate);

        const endDate = new Date(singleContract.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new BadRequestException(
            'Invalid contract startDate or endDate',
          );
        }

        await prisma.contract.create({
          data: {
            employeeId: updatedEmployee.uuid,

            companyId: updatedEmployee.companyId,

            startDate,

            endDate,

            contract_type: singleContract.contract_type,

            baseSalary: singleContract.baseSalary,

            currency: singleContract.currency || 'XAF',

            status: 'ACTIVE',
          },
        });
      }

      if (document) {
        const path = await this.rustfs.uploadFile(
          document,

          `employees/${updatedEmployee.uuid}`,
        );

        return prisma.employee.update({
          where: { uuid },

          data: { idDocumentFileUrl: path },
        });
      }

      return updatedEmployee;
    });
  }

  async changeEmployeePassword(userUuid: string, newPassword: string) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: userUuid },

      include: {
        user: {},
      },
    });

    console.log(employee?.user?.passwordHash);

    if (!employee) throw new BadRequestException('Employee not not found');

    if (!employee?.user?.passwordHash) return;

    // const isPasswordValid = await bcrypt.compare(newPassword, employee?.user?.passwordHash);

    // if (!isPasswordValid) {

    //   throw new BadRequestException('Mot de passe actuel incorrect');

    // }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.databaseService.user.update({
      where: { uuid: employee?.user?.uuid },

      data: { passwordHash: hashedPassword },
    });

    return {
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  async deactivate(uuid: string) {
    const existing = await this.databaseService.employee.findUnique({
      where: { uuid },
    });

    if (!existing) throw new NotFoundException('Employee not found');

    return this.databaseService.$transaction(async (prisma) => {
      const deactivated = await prisma.employee.update({
        where: { uuid },

        data: { isActive: false },
      });

      await prisma.department.updateMany({
        where: { employeeUuid: uuid },

        data: { employeeUuid: null },
      });

      return deactivated;
    });
  }

  async reactivate(uuid: string) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    return this.databaseService.employee.update({
      where: { uuid },

      data: { isActive: true },
    });
  }

  async setRole(uuid: string, role: string) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid },

      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!employee.user) {
      throw new NotFoundException('Employee does not have a user account');
    }

    return this.databaseService.user.update({
      where: { uuid: employee.user.uuid },

      data: { role: role as SystemRole },

      select: {
        uuid: true,

        email: true,

        role: true,

        employeeId: true,
      },
    });
  }
}
