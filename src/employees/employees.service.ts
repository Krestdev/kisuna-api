import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return this.databaseService.employee.create({
      data: createEmployeeDto,
    });
  }

  findAll() {
    return this.databaseService.employee.findMany({
      include: {
        department: true,
        position: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  findOne(uuid: string) {
    return this.databaseService.employee.findUnique({
      where: { uuid },
      include: {
        department: true,
        position: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  update(uuid: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.databaseService.employee.update({
      where: { uuid },
      data: updateEmployeeDto,
    });
  }

  remove(uuid: string) {
    return this.databaseService.employee.delete({
      where: { uuid },
    });
  }
}
