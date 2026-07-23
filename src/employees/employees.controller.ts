import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { changeEmployeePassword } from './dto/change-employee-password.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SetRoleDto } from './dto/set-role.dto';
import { SystemRole } from '../../generated/prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanyScope } from '../common/decorators/company-scope.decorator';
interface ScopedRequest {
  userCompanyId?: string;
}

import { CompanyScopeGuard } from '../common/guards/company-scope.guard';

import { ContractsService } from '../contracts/contracts.service';

import { CreateContractDto } from '../contracts/dto/create-contract.dto';

import { LeavesService } from '../leaves/leaves.service';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(
    private readonly employeesService: EmployeesService,

    private readonly contractsService: ContractsService,

    private readonly leavesService: LeavesService,
  ) {}

  @Post()
  @UseGuards(RolesGuard, CompanyScopeGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @CompanyScope()
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,

    @Request() req: ScopedRequest,

    @UploadedFile() document?: Express.Multer.File,
  ) {
    this.logger.log('=== CREATE EMPLOYEE REQUEST ===');

    this.logger.log('Body:', JSON.stringify(createEmployeeDto, null, 2));

    this.logger.log('Department ID:', createEmployeeDto.departmentId);

    this.logger.log(
      'Document:',

      document
        ? `${document.originalname} (${document.size} bytes)`
        : 'No file',
    );

    return this.employeesService.create(
      createEmployeeDto,

      req.userCompanyId,

      document,
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), CompanyScopeGuard)
  @CompanyScope()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all employees with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of employees' })
  findAll(
    @Query() query: Record<string, unknown>,
    @Request() req: ScopedRequest,
  ) {
    return this.employeesService.findAll(query, req.userCompanyId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), CompanyScopeGuard)
  @CompanyScope()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  findOne(@Param('id') id: string, @Request() req: ScopedRequest) {
    return this.employeesService.findOne(id, req.userCompanyId);
  }

  @Get(':id/personal')
  @UseGuards(RolesGuard, CompanyScopeGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @CompanyScope()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get employee personal information (sensitive data)',
  })
  @ApiOperation({
    summary: 'Get employee personal information (sensitive data)',
  })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee personal details' })
  findPersonal(@Param('id') id: string, @Request() req: ScopedRequest) {
    return this.employeesService.findPersonal(id, req.userCompanyId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({ summary: 'Update employee information' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  update(
    @Param('id') id: string,

    @Body() updateEmployeeDto: UpdateEmployeeDto,

    @UploadedFile() document?: Express.Multer.File,
  ) {
    console.log('updateEmployeeDto controller : ', updateEmployeeDto);

    console.log('updateEmployeeDto controller : ', updateEmployeeDto);

    return this.employeesService.update(id, updateEmployeeDto, document);
  }

  @Delete(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deactivate employee (soft delete + free up positions)',
  })
  @ApiOperation({
    summary: 'Deactivate employee (soft delete + free up positions)',
  })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,

    description: 'Employee deactivated successfully',
  })
  @ApiResponse({
    status: 200,

    description: 'Employee deactivated successfully',
  })
  deactivate(@Param('id') id: string) {
    return this.employeesService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reactivate a deactivated employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,

    description: 'Employee reactivated successfully',
  })
  @ApiResponse({
    status: 200,

    description: 'Employee reactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  reactivate(@Param('id') id: string) {
    return this.employeesService.reactivate(id);
  }

  @Patch(':id/password')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'change employee password' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({
    status: 200,

    description: 'Employee password changed successfully successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  changeEmployeePassword(
    @Param('id') id: string,

    @Body() dto: changeEmployeePassword,
  ) {
    return this.employeesService.changeEmployeePassword(id, dto.newPassword);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set employee role (SUPER_ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({
    status: 404,

    description: 'Employee or user account not found',
  })
  @ApiResponse({
    status: 404,

    description: 'Employee or user account not found',
  })
  setRole(@Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.employeesService.setRole(id, dto.role);
  }

  @Post(':id/contracts')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new contract for an employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  createContract(
    @Param('id') id: string,

    @Body() createContractDto: CreateContractDto,
  ) {
    return this.contractsService.create(id, createContractDto);
  }

  @Get(':id/leaves')
  @ApiOperation({ summary: 'Get all leave requests for an employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'List of leave requests' })
  getEmployeeLeaves(@Param('id') id: string) {
    return this.leavesService.findByEmployee(id);
  }

  @Get(':id/leaves/balance')
  @ApiOperation({ summary: 'Get leave balance for an employee' })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiResponse({ status: 200, description: 'Leave balance details' })
  getLeaveBalance(@Param('id') id: string) {
    return this.leavesService.getLeaveBalance(id);
  }

  @Patch(':id/leaves/balance/:year')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update leave balance quota for an employee (admin only)',
  })
  @ApiOperation({
    summary: 'Update leave balance quota for an employee (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Employee UUID' })
  @ApiParam({ name: 'year', description: 'Year' })
  updateLeaveQuota(
    @Param('id') id: string,

    @Param('year') year: string,

    @Body() dto: { totalDays: number },
  ) {
    return this.leavesService.updateBalanceQuota(
      id,

      parseInt(year),

      dto.totalDays,
    );
  }
}
