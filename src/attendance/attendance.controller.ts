import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MarkAbsentDto } from './dto/mark-absent.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BatchAttendanceItemDto } from './dto/batch-attendance.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRole, AttendanceStatus } from '../../generated/prisma/client';
import { CompanyScope } from '../common/decorators/company-scope.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CompanyScopeGuard } from 'src/common/guards/company-scope.guard';
@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('batch')
  @ApiBearerAuth('JWT-auth')
  @CompanyScope()
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({
    summary: 'Manually create multiple attendance records (admin)',
  })
  @ApiResponse({ status: 201, description: 'Attendance records created' })
  createMany(@Body() body: BatchAttendanceItemDto[]) {
    const records: CreateAttendanceDto[] = body.map((item) => {
      const dateBase = item.date.split('T')[0];
      const checkIn = item.checkIn
        ? new Date(`${dateBase}T${item.checkIn}`).toISOString()
        : new Date(item.date).toISOString();
      const checkOut = item.checkOut
        ? new Date(`${dateBase}T${item.checkOut}`).toISOString()
        : undefined;
      return {
        employeeId: item.userId,
        checkIn,
        checkOut,
        status: (item.statut as unknown as AttendanceStatus[]) ?? [
          AttendanceStatus.PRESENT,
        ],
        latitude: item.latitude,
        longitude: item.longitude,
      };
    });
    return this.attendanceService.createMany(records);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Manually create an attendance record (admin)' })
  @ApiResponse({ status: 201, description: 'Attendance record created' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Get()
  @CompanyScope()
  @UseGuards(AuthGuard('jwt'), CompanyScopeGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(
    SystemRole.SUPER_ADMIN,
    SystemRole.COMPANY_ADMIN,
    SystemRole.ADMIN,
    SystemRole.EMPLOYEE,
  )
  @ApiOperation({
    summary: 'List all attendance records',
    description:
      'Get all attendance records with optional filtering by month and year.',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month (1-12)',
    example: 6,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year',
    example: 2026,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Paginated attendance records' })
  findAll(@Query() query: Record<string, unknown>) {
    return this.attendanceService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(
    SystemRole.SUPER_ADMIN,
    SystemRole.COMPANY_ADMIN,
    SystemRole.ADMIN,
    SystemRole.EMPLOYEE,
  )
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance UUID' })
  @ApiResponse({ status: 200, description: 'Attendance record found' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update attendance record',

    description:
      'Manual correction of attendance data. Admin only. Recalculates worked hours if both check-in and check-out are updated.',
  })
  @ApiParam({ name: 'id', description: 'Attendance UUID' })
  @ApiResponse({ status: 200, description: 'Attendance record updated' })
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete attendance record',

    description: 'Admin only. Permanently removes attendance record.',
  })
  @ApiParam({ name: 'id', description: 'Attendance UUID' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(id);
  }

  @Post('absent')
  @ApiOperation({
    summary: 'Mark employee absent',

    description:
      'Admin only. Manually create an absence record for a specific date. GPS coordinates set to 0,0.',
  })
  @ApiResponse({ status: 201, description: 'Absence record created' })
  markAbsent(@Body() dto: MarkAbsentDto) {
    return this.attendanceService.markAbsent(dto);
  }

  @Get('employee/:employeeId')
  @ApiOperation({
    summary: 'Get employee attendance history',

    description:
      'Retrieve all attendance records for a specific employee with optional month/year filtering.',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month (1-12)',
    example: 6,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year',
    example: 2026,
  })
  @ApiResponse({ status: 200, description: 'Employee attendance records' })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.findByEmployee(
      employeeId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('employee/:employeeId/summary')
  @ApiOperation({
    summary: 'Get monthly attendance summary',
    description:
      'Aggregated statistics for payroll: total days, present/late/absent counts, total hours worked, and overtime. Required for payroll calculations.',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee UUID' })
  @ApiQuery({
    name: 'month',
    required: true,
    description: 'Month (1-12)',
    example: 6,
  })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Year',
    example: 2026,
  })
  getMonthlySummary(
    @Param('employeeId') employeeId: string,

    @Query('month') month: string,

    @Query('year') year: string,
  ) {
    return this.attendanceService.getMonthlySummary(
      employeeId,

      parseInt(month),

      parseInt(year),
    );
  }
}
