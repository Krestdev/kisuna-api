import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PayrollsService } from './payrolls.service';
import { AdjustPayrollDto } from './dto/adjust-payroll.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole } from '../../generated/prisma/client';

@ApiTags('Payrolls')
@Controller('payrolls')
@UseGuards(RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PayrollsController {
  constructor(private readonly payrollsService: PayrollsService) {}

  @Post('generate')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Generate payroll for an employee (draft)' })
  generatePayroll(
    @Body('employeeId') employeeId: string,
    @Body('month') month: number,
    @Body('year') year: number,
  ) {
    return this.payrollsService.generatePayroll(employeeId, month, year);
  }

  @Get()
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'List all payrolls or filter by period' })
  findAll(@Query('month') month?: number, @Query('year') year?: number) {
    if (month && year) {
      return this.payrollsService.findByPeriod(+month, +year);
    }

    return this.payrollsService.findAll();
  }

  @Get('employee/:employeeId')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Get payrolls by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payrollsService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Get one payroll' })
  findOne(@Param('id') id: string) {
    return this.payrollsService.findOne(id);
  }

  @Patch(':id')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  @ApiOperation({ summary: 'Manual adjustment (bonus, deduction)' })
  adjustPayroll(@Param('id') id: string, @Body() dto: AdjustPayrollDto) {
    return this.payrollsService.adjustPayroll(id, dto);
  }

  @Patch(':id/approve')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Approve payroll' })
  approvePayroll(@Param('id') id: string) {
    return this.payrollsService.approvePayroll(id);
  }

  @Patch(':id/mark-paid')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Mark as paid' })
  markPaid(@Param('id') id: string) {
    return this.payrollsService.markPaid(id);
  }

  @Delete(':id')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Delete DRAFT payroll' })
  remove(@Param('id') id: string) {
    return this.payrollsService.remove(id);
  }
}
