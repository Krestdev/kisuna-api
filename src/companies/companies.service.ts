import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FindAllCompaniesDto } from './dto/find-all-companies.dto';
import { Company } from 'generated/prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.databaseService.company.create({ data: createCompanyDto });
  }

  async findAll({
    page = 1,
    limit = 20,
    name,
    description,
  }: FindAllCompaniesDto): Promise<Company[]> {
    const skip = (page - 1) * limit;

    return this.databaseService.company.findMany({
      where: {
        name,
        description,
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        departments: true,
        employees: {
          where: { isActive: true },
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            position: true,
          },
        },
      },
    });
  }

  async findOne(uuid: string): Promise<Company> {
    const company = await this.databaseService.company.findUnique({
      where: { uuid },
      include: {
        departments: true,
        contracts: true,
        employees: {
          where: { isActive: true },
        },
      },
    });
    if (!company)
      throw new NotFoundException(`Company with ID ${uuid} not found`);
    return company;
  }

  async update(
    uuid: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const updatedCompany = await this.databaseService.company.update({
      where: { uuid },
      data: updateCompanyDto,
    });
    if (!updatedCompany)
      throw new NotFoundException(`Company with ID ${uuid} not found`);
    return updatedCompany;
  }

  async activate(uuid: string): Promise<Company> {
    const updatedCompany = await this.databaseService.company.update({
      where: { uuid },
      data: { isActive: true },
    });
    if (!updatedCompany)
      throw new NotFoundException(`Company with ID ${uuid} not found`);
    return updatedCompany;
  }

  async deactivate(uuid: string): Promise<Company> {
    const updatedCompany = await this.databaseService.company.update({
      where: { uuid },
      data: { isActive: false },
    });
    if (!updatedCompany)
      throw new NotFoundException(`Company with ID ${uuid} not found`);
    return updatedCompany;
  }

  async remove(uuid: string): Promise<Company> {
    const company = await this.databaseService.company.findUnique({
      where: { uuid },
      include: { departments: true, contracts: true },
    });
    if (!company)
      throw new NotFoundException(`Company with ID ${uuid} not found`);
    if (company.departments.length > 0)
      throw new BadRequestException(
        'Cannot delete company: active departments exist',
      );
    if (company.contracts.length > 0)
      throw new BadRequestException(
        'Cannot delete company: active contracts exist',
      );
    return this.databaseService.company.delete({ where: { uuid } });
  }
}
