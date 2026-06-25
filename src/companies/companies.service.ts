import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(createCompanyDto: CreateCompanyDto) {
    return this.databaseService.company.create({ data: createCompanyDto });
  }

  async findAll() {
    return this.databaseService.company.findMany({
      include: {
        departments: true,
        contracts: true,
        employees: {
          where: { isActive: true },
        }
      },
    });
  }

  async findOne(uuid: string) {
    const company = await this.databaseService.company.findUnique({
      where: { uuid },
      include: {
        departments: true,
        contracts: true,
        employees: {
          where: { isActive: true },
        }
      },
    });
    if (!company) throw new NotFoundException(`Company with ID ${uuid} not found`);
    return company;
  }

  async update(uuid: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(uuid);
    return this.databaseService.company.update({ where: { uuid }, data: updateCompanyDto });
  }

  async remove(uuid: string) {
    const company = await this.databaseService.company.findUnique({
      where: { uuid },
      include: { departments: true, contracts: true },
    });
    if (!company) throw new NotFoundException(`Company with ID ${uuid} not found`);
    if (company.departments.length > 0)
      throw new BadRequestException('Cannot delete company: active departments exist');
    if (company.contracts.length > 0)
      throw new BadRequestException('Cannot delete company: active contracts exist');
    return this.databaseService.company.delete({ where: { uuid } });
  }
}
