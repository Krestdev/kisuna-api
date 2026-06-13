import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validateManagerBelongsToCompany(companyId: string, employeeUuid: string) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: employeeUuid },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${employeeUuid} not found`);

    if (employee.companyId !== companyId) {
      throw new BadRequestException(`Employee does not belong to company ID ${companyId}`);
    }
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { companyId, employeeUuid, ...rest } = createDepartmentDto;

    const company = await this.databaseService.company.findUnique({ where: { uuid: companyId } });
    if (!company) throw new NotFoundException(`Company with ID ${companyId} not found`);

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

  async findAll(companyId?: string) {
    return this.databaseService.department.findMany({
      where: { isActive: true, ...(companyId ? { companyId } : {}) },
      include: { company: true, employee: true },
    });
  }

  async findOne(uuid: string) {
    const department = await this.databaseService.department.findUnique({
      where: { uuid },
      include: { company: true, employee: true, positions: true },
    });
    if (!department || !department.isActive)
      throw new NotFoundException(`Active Department with ID ${uuid} not found`);
    return department;
  }

  async update(uuid: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(uuid);
    const targetCompanyId = updateDepartmentDto.companyId ?? department.companyId;

    if (updateDepartmentDto.employeeUuid) {
      await this.validateManagerBelongsToCompany(targetCompanyId, updateDepartmentDto.employeeUuid);
    }

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

  async assignManager(uuid: string, employeeUuid: string) {
    const department = await this.findOne(uuid);
    await this.validateManagerBelongsToCompany(department.companyId, employeeUuid);
    return this.databaseService.department.update({
      where: { uuid },
      data: { employee: { connect: { uuid: employeeUuid } } },
    });
  }

  async remove(uuid: string) {
    const department = await this.findOne(uuid);
    if (department.positions.length > 0)
      throw new BadRequestException('Cannot delete department. It still has active positions.');
    return this.databaseService.department.update({
      where: { uuid },
      data: { isActive: false },
    });
  }
}
