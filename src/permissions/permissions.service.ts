import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.databaseService.permission.create({ data: createPermissionDto });
  }

  async findAll() {
    return this.databaseService.permission.findMany();
  }

  async findOne(uuid: string) {
    const permission = await this.databaseService.permission.findUnique({
      where: { uuid },
      include: { positions: true },
    });
    if (!permission) throw new NotFoundException(`Permission with ID ${uuid} not found`);
    return permission;
  }

  async update(uuid: string, updatePermissionDto: UpdatePermissionDto) {
    await this.findOne(uuid);
    return this.databaseService.permission.update({ where: { uuid }, data: updatePermissionDto });
  }

  async remove(uuid: string) {
    const permission = await this.findOne(uuid);
    if (permission.positions.length > 0)
      throw new BadRequestException('Cannot delete permission. It is currently assigned to one or more positions.');
    return this.databaseService.permission.delete({ where: { uuid } });
  }
}
