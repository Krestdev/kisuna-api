import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createDepartmentDto: CreateDepartmentDto) {
    return this.databaseService.department.create({
      data: createDepartmentDto,
    });
  }

  findAll() {
    return this.databaseService.department.findMany();
  }

  findOne(uuid: string) {
    return this.databaseService.department.findUnique({
      where: { uuid },
    });
  }

  update(uuid: string, updateDepartmentDto: UpdateDepartmentDto) {
    return this.databaseService.department.update({
      where: { uuid },
      data: updateDepartmentDto,
    });
  }

  remove(uuid: string) {
    return this.databaseService.department.delete({
      where: { uuid },
    });
  }
}
