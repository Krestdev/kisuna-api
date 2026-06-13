import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validateEmployeeBelongsToCompany(departmentId: string, employeeUuid: string) {
    const department = await this.databaseService.department.findUnique({
      where: { uuid: departmentId },
      select: { companyId: true },
    });
    if (!department) throw new NotFoundException('Department not found');

    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: employeeUuid },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    if (employee.companyId !== department.companyId) {
      throw new BadRequestException(`Employee does not belong to the same company as the department`);
    }
  }

  async create(createPositionDto: CreatePositionDto) {
    const { departmentId, employeeUuid, permissionUuids, ...rest } = createPositionDto;

    const department = await this.databaseService.department.findUnique({ where: { uuid: departmentId } });
    if (!department) throw new NotFoundException(`Department with ID ${departmentId} not found`);

    if (employeeUuid) {
      await this.validateEmployeeBelongsToCompany(departmentId, employeeUuid);
    }

    return this.databaseService.$transaction(async (prisma) => {
      const position = await prisma.position.create({
        data: {
          ...rest,
          department: { connect: { uuid: departmentId } },
          ...(employeeUuid ? { employee: { connect: { uuid: employeeUuid } } } : {}),
        },
      });

      if (permissionUuids && permissionUuids.length > 0) {
        await prisma.positionPermission.createMany({
          data: permissionUuids.map(permUuid => ({
            positionUuid: position.uuid,
            permissionUuid: permUuid,
          })),
          skipDuplicates: true,
        });
      }

      return position;
    });
  }

  async findAll(departmentId?: string, companyId?: string) {
    return this.databaseService.position.findMany({
      where: {
        isActive: true,
        ...(departmentId ? { departmentId } : {}),
        ...(companyId ? { department: { companyId } } : {}),
      },
      include: {
        department: { include: { company: true } },
        employee: true,
        permissions: { include: { permission: true } },
      },
    });
  }

  async findOne(uuid: string) {
    const position = await this.databaseService.position.findUnique({
      where: { uuid },
      include: {
        department: { include: { company: true } },
        employee: true,
        permissions: { include: { permission: true } },
      },
    });
    if (!position || !position.isActive)
      throw new NotFoundException(`Active Position with ID ${uuid} not found`);
    return position;
  }

  async update(uuid: string, updatePositionDto: UpdatePositionDto) {
    const position = await this.findOne(uuid);
    const { permissionUuids, departmentId, employeeUuid, ...rest } = updatePositionDto;

    const targetDepartmentId = departmentId ?? position.departmentId;

    if (employeeUuid) {
      await this.validateEmployeeBelongsToCompany(targetDepartmentId, employeeUuid);
    }

    return this.databaseService.$transaction(async (prisma) => {
      const updatedPosition = await prisma.position.update({
        where: { uuid },
        data: {
          ...rest,
          ...(departmentId ? { department: { connect: { uuid: departmentId } } } : {}),
          ...(employeeUuid ? { employee: { connect: { uuid: employeeUuid } } } : {}),
        },
      });

      if (permissionUuids !== undefined) {
        await prisma.positionPermission.deleteMany({ where: { positionUuid: uuid } });
        if (permissionUuids.length > 0) {
          await prisma.positionPermission.createMany({
            data: permissionUuids.map(permUuid => ({
              positionUuid: uuid,
              permissionUuid: permUuid,
            })),
            skipDuplicates: true,
          });
        }
      }

      return updatedPosition;
    });
  }

  async assignEmployee(uuid: string, employeeUuid: string) {
    const position = await this.findOne(uuid);
    await this.validateEmployeeBelongsToCompany(position.departmentId, employeeUuid);
    return this.databaseService.position.update({
      where: { uuid },
      data: { employee: { connect: { uuid: employeeUuid } } },
    });
  }

  async removePermission(uuid: string, permissionUuid: string) {
    await this.findOne(uuid);
    return this.databaseService.positionPermission.delete({
      where: {
        positionUuid_permissionUuid: { positionUuid: uuid, permissionUuid },
      },
    });
  }

  async remove(uuid: string) {
    const position = await this.findOne(uuid);
    if (position.employeeUuid)
      throw new BadRequestException('Cannot delete position. An employee is currently assigned to it.');
    return this.databaseService.position.update({
      where: { uuid },
      data: { isActive: false },
    });
  }
}
