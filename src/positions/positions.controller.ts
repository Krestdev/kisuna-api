import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { SystemRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department UUID' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company UUID' })
  @ApiResponse({ status: 200, description: 'List of positions' })
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('companyId') companyId?: string
  ) {
    return this.positionsService.findAll(departmentId, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiResponse({ status: 200, description: 'Position details' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update position' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Patch(':id/employee/:employeeId')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign an employee to a position' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID to assign' })
  @ApiResponse({ status: 200, description: 'Employee assigned successfully' })
  assignEmployee(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.positionsService.assignEmployee(id, employeeId);
  }

  @Delete(':id/permissions/:permissionId')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a single permission from a position' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiParam({ name: 'permissionId', description: 'Permission UUID to remove' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.positionsService.removePermission(id, permissionId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft-delete position' })
  @ApiParam({ name: 'id', description: 'Position UUID' })
  @ApiResponse({ status: 200, description: 'Position deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete: employee currently assigned' })
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
