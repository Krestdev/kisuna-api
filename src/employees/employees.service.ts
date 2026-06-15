import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FindAllEmployeesDto } from './dto/find-all-employees.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

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

  async findAll(query: FindAllEmployeesDto) {
    const {
      page = 1,
      limit = 10,
      companyId,
      departmentId,
      positionUuid,
      status,
      search,
      includeInactive,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      ...(includeInactive === 'true' ? {} : { isActive: true }),
      ...(companyId ? { companyId } : {}),
      ...(status ? { status } : {}),
    };

    if (departmentId) {
      where.positions = {
        some: { departmentId },
      };
    }

    if (positionUuid) {
      where.positions = {
        some: { uuid: positionUuid },
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.databaseService.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          positions: { include: { department: true } },
          managedDepartments: true,
          user: { select: { uuid: true, email: true, role: true } },
        },
      }),
      this.databaseService.employee.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async uploadDocument(employeeId: string, uploadDto: UploadDocumentDto) {
    const employee = await this.databaseService.employee.findUnique({ where: { uuid: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const { file_name, document_type, path, expired_date } = uploadDto;
    return this.databaseService.file.create({
      data: {
        file_name,
        document_type,
        path,
        expired_date: expired_date ? new Date(expired_date) : undefined,
        employeeId,
      },
    });
  }

  async getDocuments(employeeId: string) {
    const employee = await this.databaseService.employee.findUnique({ where: { uuid: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.databaseService.file.findMany({
      where: { employeeId },
      orderBy: { createAt: 'desc' },
    });
  }

  async getDocument(employeeId: string, docId: string) {
    const document = await this.databaseService.file.findFirst({
      where: { uuid: docId, employeeId },
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async deleteDocument(employeeId: string, docId: string) {
    const document = await this.databaseService.file.findFirst({
      where: { uuid: docId, employeeId },
    });
    if (!document) throw new NotFoundException('Document not found');

    return this.databaseService.file.delete({
      where: { uuid: docId },
    });
  }
}
