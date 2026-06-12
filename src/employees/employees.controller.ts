import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SystemRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company ID' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive employees' })
  @ApiResponse({ status: 200, description: 'List of employees' })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.employeesService.findAll(
      companyId ? +companyId : undefined,
      includeInactive === 'true'
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Get(':id/personal')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get employee personal information (sensitive data)' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee personal details' })
  findPersonal(@Param('id') id: string) {
    return this.employeesService.findPersonal(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update employee information' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee deactivated successfully' })
  deactivate(@Param('id') id: string) {
    return this.employeesService.deactivate(+id);
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reactivate employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Employee reactivated successfully' })
  reactivate(@Param('id') id: string) {
    return this.employeesService.reactivate(+id);
  }
}
