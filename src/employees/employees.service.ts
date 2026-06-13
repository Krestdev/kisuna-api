import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const { positionUuid, birthday, hireDate, companyId, ...rest } = createEmployeeDto;

    return this.databaseService.$transaction(async (prisma) => {
      const employee = await prisma.employee.create({
        data: {
          ...rest,
          birthday: birthday ? new Date(birthday) : undefined,
          hireDate: hireDate ? new Date(hireDate) : undefined,
          ...(companyId ? { company: { connect: { uuid: companyId } } } : {}),
        },
      });

      if (positionUuid) {
        await prisma.position.update({
          where: { uuid: positionUuid },
          data: { employeeUuid: employee.uuid },
        });
      }

      return employee;
    });
  }

  async findAll(companyId?: string, includeInactive?: boolean) {
    return this.databaseService.employee.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(companyId ? { companyId } : {}),
      },
      include: {
        positions: true,
        managedDepartments: true,
        user: { select: { uuid: true, email: true, role: true } },
      },
    });
  }

  async findOne(uuid: string) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid },
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
    if (!employee || !employee.isActive)
      throw new NotFoundException(`Active Employee with ID ${uuid} not found`);
    return employee;
  }

  async findPersonal(uuid: string) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid },
      include: {
        positions: { include: { department: true } },
        managedDepartments: true,
        user: { select: { uuid: true, email: true, role: true } },
      },
    });
    if (!employee || !employee.isActive)
      throw new NotFoundException(`Active Employee with ID ${uuid} not found`);
    return employee;
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
}
