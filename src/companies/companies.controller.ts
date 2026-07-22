import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CompaniesService } from './companies.service';

import { CreateCompanyDto } from './dto/create-company.dto';

import { UpdateCompanyDto } from './dto/update-company.dto';

import { FindAllCompaniesDto } from './dto/find-all-companies.dto';

import { SystemRole } from '../../generated/prisma/client';

import { Roles } from '../common/decorators/roles.decorator';

import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'List of companies' })
  findAll(@Query() query: Record<string, unknown>) {
    return this.companiesService.findAll(query as FindAllCompaniesDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activate a company' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company activated successfully' })
  activate(@Param('id') id: string) {
    return this.companiesService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate a company' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company deactivated successfully' })
  deactivate(@Param('id') id: string) {
    return this.companiesService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete company' })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({
    status: 400,

    description: 'Cannot delete: active departments or contracts exist',
  })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
