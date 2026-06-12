import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validateManagerBelongsToCompany(companyId: number, employeeUuid: number) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: employeeUuid },
      include: {
        positions: { include: { department: true } },
        managedDepartments: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeUuid} not found`);
    }

    const belongsViaPosition = employee.positions.some(p => p.department?.companyId === companyId);
    const belongsViaManagement = employee.managedDepartments.some(d => d.companyId === companyId);

    if (!belongsViaPosition && !belongsViaManagement) {
      throw new BadRequestException(`Employee does not belong to company ID ${companyId}`);
    }
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { companyId, employeeUuid, ...rest } = createDepartmentDto;

    const company = await this.databaseService.company.findUnique({ where: { uuid: companyId } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    if (employeeUuid) {
      await this.validateManagerBelongsToCompany(companyId, employeeUuid);
    }

    return this.databaseService.department.create({
      data: {
        ...rest,
        company: { connect: { uuid: companyId } },
        ...(employeeUuid ? { employee: { connect: { uuid: employeeUuid } } } : {}),
      },
    });
  }

  async findAll(companyId?: number) {
    return this.databaseService.department.findMany({
      where: {
        isActive: true,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        company: true,
        employee: true,
      },
    });
  }

  async findOne(uuid: number) {
    const department = await this.databaseService.department.findUnique({
      where: { uuid },
      include: {
        company: true,
        employee: true,
        positions: true,
      },
    });

    if (!department || !department.isActive) {
      throw new NotFoundException(`Active Department with ID ${uuid} not found`);
    }

    return department;
  }

  async update(uuid: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(uuid);

    const targetCompanyId = updateDepartmentDto.companyId ?? department.companyId;

    if (updateDepartmentDto.employeeUuid) {
      await this.validateManagerBelongsToCompany(targetCompanyId, updateDepartmentDto.employeeUuid);
    }

    // Prisma update
    const { companyId, employeeUuid, ...rest } = updateDepartmentDto;
    
    return this.databaseService.department.update({
      where: { uuid },
      data: {
        ...rest,
        ...(companyId ? { company: { connect: { uuid: companyId } } } : {}),
        ...(employeeUuid ? { employee: { connect: { uuid: employeeUuid } } } : {}),
      },
    });
  }

  async assignManager(uuid: number, employeeUuid: number) {
    const department = await this.findOne(uuid);
    await this.validateManagerBelongsToCompany(department.companyId, employeeUuid);

    return this.databaseService.department.update({
      where: { uuid },
      data: {
        employee: { connect: { uuid: employeeUuid } }
      }
    });
  }

  async remove(uuid: number) {
    const department = await this.findOne(uuid);

    if (department.positions.length > 0) {
      throw new BadRequestException('Cannot delete department. It still has active positions.');
    }

    // Soft delete
    return this.databaseService.department.update({
      where: { uuid },
      data: { isActive: false },
    });
  }
}
