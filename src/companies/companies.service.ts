import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    return this.databaseService.company.create({
      data: createCompanyDto,
    });
  }

  async findAll() {
    return this.databaseService.company.findMany();
  }

  async findOne(uuid: number) {
    const company = await this.databaseService.company.findUnique({
      where: { uuid },
      include: {
        departments: true,
        contracts: true,
      },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${uuid} not found`);
    }
    return company;
  }

  async update(uuid: number, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(uuid); // Ensure it exists
    return this.databaseService.company.update({
      where: { uuid },
      data: updateCompanyDto,
    });
  }

  async remove(uuid: number) {
    const company = await this.findOne(uuid);
    
    if (company.departments.length > 0 || company.contracts.length > 0) {
      throw new BadRequestException('Cannot delete company. It still has associated departments or contracts.');
    }

    return this.databaseService.company.delete({
      where: { uuid },
    });
  }
}
