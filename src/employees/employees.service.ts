import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FindAllEmployeesDto } from './dto/find-all-employees.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: CreateEmployeeDto, userCompanyId?: string) {
    const { positionUuid, birthday, hireDate, companyId, contract, idDocumentIssueDate, idDocumentExpiryDate, email, ...rest } = createEmployeeDto;

    // For COMPANY_ADMIN, force their company ID
    const finalCompanyId = userCompanyId || companyId;

    return this.databaseService.$transaction(async (prisma) => {
      const employee = await prisma.employee.create({
        data: {
          ...rest,
          birthday: birthday ? new Date(birthday) : undefined,
          hireDate: hireDate ? new Date(hireDate) : undefined,
          idDocumentIssueDate: idDocumentIssueDate ? new Date(idDocumentIssueDate) : undefined,
          idDocumentExpiryDate: idDocumentExpiryDate ? new Date(idDocumentExpiryDate) : undefined,
          ...(finalCompanyId ? { company: { connect: { uuid: finalCompanyId } } } : {}),
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

      // Assign position if provided
      if (positionUuid) {
        await prisma.position.update({
          where: { uuid: positionUuid },
          data: { employeeUuid: employee.uuid },
        });
      }

      // Create contract if provided
      if (contract && finalCompanyId) {
        await prisma.contract.create({
          data: {
            employeeId: employee.uuid,
            companyId: finalCompanyId,
            startDate: new Date(contract.startDate),
            endDate: new Date(contract.endDate),
            contract_type: contract.contract_type,
            baseSalary: contract.baseSalary,
            currency: contract.currency || 'XAF',
          },
        });
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
      positionUuid,
      status,
      search,
      includeInactive,
    } = query;

    // For COMPANY_ADMIN, filter by their company
    const finalCompanyId = userCompanyId || (companyId?.trim() || undefined);

    // Check if any valid params provided (ignore empty strings)
    const hasParams = !!(page || limit || departmentId?.trim() || positionUuid?.trim() || status?.trim() || search?.trim() || includeInactive);
    const returnAll = userCompanyId && !hasParams;

    const actualPage = page || 1;
    const actualLimit = returnAll ? undefined : (limit || 10);
    const skip = returnAll ? undefined : (actualPage - 1) * (actualLimit || 10);

    const where: any = {
      ...(includeInactive === 'true' ? {} : { isActive: true }),
      ...(finalCompanyId && { companyId: finalCompanyId }),
      ...(status?.trim() && { status }),
    };

    if (departmentId?.trim()) {
      where.positions = {
        some: { departmentId },
      };
    }

    if (positionUuid?.trim()) {
      where.positions = {
        some: { uuid: positionUuid },
      };
    }

    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.databaseService.employee.findMany({
        where,
        ...(skip !== undefined && { skip }),
        ...(actualLimit !== undefined && { take: actualLimit }),
        include: {
          positions: { include: { department: true } },
          managedDepartments: true,
          user: { select: { uuid: true, email: true, role: true } },
        },
      }),
      this.databaseService.employee.count({ where }),
    ]);

    return {
      data: data.map(emp => ({
        ...emp,
        role: emp.user?.role || null,
      })),
      meta: {
        total,
        page: actualPage,
        limit: actualLimit || total,
        totalPages: actualLimit ? Math.ceil(total / actualLimit) : 1,
      },
    };
  }

  async findOne(uuid: string, userCompanyId?: string) {
    const where: any = { uuid, isActive: true };
    if (userCompanyId) {
      where.companyId = userCompanyId;
    }

    const employee = await this.databaseService.employee.findFirst({
      where,
      select: {
        uuid: true,
        firstName: true,
        lastName: true,
        gender: true,
        hireDate: true,
        status: true,
        isActive: true,
        companyId: true,
        positions: { include: { department: true } },
        managedDepartments: true,
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
    const where: any = { uuid, isActive: true };
    if (userCompanyId) {
      where.companyId = userCompanyId;
    }

    const employee = await this.databaseService.employee.findFirst({
      where,
      include: {
        positions: { include: { department: true } },
        managedDepartments: true,
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

  async update(uuid: string, updateEmployeeDto: UpdateEmployeeDto) {
    const existing = await this.databaseService.employee.findUnique({ where: { uuid } });
    if (!existing || !existing.isActive) throw new NotFoundException('Active employee not found');

    const { positionUuid, birthday, hireDate, companyId, ...rest } = updateEmployeeDto;

    return this.databaseService.$transaction(async (prisma) => {
      const updatedEmployee = await prisma.employee.update({
        where: { uuid },
        data: {
          ...rest,
          birthday: birthday ? new Date(birthday) : undefined,
          hireDate: hireDate ? new Date(hireDate) : undefined,
          ...(companyId ? { company: { connect: { uuid: companyId } } } : {}),
        },
      });

      if (positionUuid !== undefined) {
        await prisma.position.update({
          where: { uuid: positionUuid },
          data: { employeeUuid: updatedEmployee.uuid },
        });
      }

      return updatedEmployee;
    });
  }

  async deactivate(uuid: string) {
    const existing = await this.databaseService.employee.findUnique({ where: { uuid } });
    if (!existing) throw new NotFoundException('Employee not found');

    return this.databaseService.$transaction(async (prisma) => {
      const deactivated = await prisma.employee.update({
        where: { uuid },
        data: { isActive: false },
      });
      await prisma.position.updateMany({
        where: { employeeUuid: uuid },
        data: { employeeUuid: null },
      });
      await prisma.department.updateMany({
        where: { employeeUuid: uuid },
        data: { employeeUuid: null },
      });
      return deactivated;
    });
  }

  async reactivate(uuid: string) {
    const employee = await this.databaseService.employee.findUnique({ where: { uuid } });
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
      data: { role: role as any },
      select: {
        uuid: true,
        email: true,
        role: true,
        employeeId: true,
      },
    });
  }
}
