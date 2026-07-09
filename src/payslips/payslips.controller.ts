import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { PayslipsService } from './payslips.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole } from '@prisma/client';

@ApiTags('Payslips')
@Controller('payslips')
@UseGuards(RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PayslipsController {
  constructor(private readonly payslipsService: PayslipsService) { }

  @Post('generate/:payrollId')
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Generate payslip from approved payroll' })
  generatePayslip(@Param('payrollId') payrollId: string) {
    return this.payslipsService.generatePayslip(payrollId);
  }

  @Get(':id')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get one payslip' })
  findOne(@Param('id') id: string) {
    return this.payslipsService.findOne(id);
  }

  @Get(':id/download')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN, SystemRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get a presigned URL to download/view the payslip PDF' })
  download(@Param('id') id: string) {
    return this.payslipsService.download(id);
  }

  @Get('employee/:employeeId')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN, SystemRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get payslips by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payslipsService.findByEmployee(employeeId);
  }
}
