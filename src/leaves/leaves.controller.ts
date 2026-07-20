import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { RequestLeaveDto } from './dto/request-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Leaves')
@ApiBearerAuth('JWT-auth')
@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  async requestLeave(@Request() req, @Body() dto: RequestLeaveDto) {
    return this.leavesService.requestLeave(req.user.employeeId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  async findAll() {
    return this.leavesService.findAll();
  }

  @Get('recent')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  async getRecent(@Query('limit') limit?: string) {
    return this.leavesService.getRecent(limit ? parseInt(limit) : 5);
  }

  @Get('history')
  async getHistory(@Query('employeeId') employeeId: string) {
    return this.leavesService.getHistory(employeeId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leavesService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  async approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.leavesService.approve(id, req.user.employeeId, req.user.role);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: RejectLeaveDto,
  ) {
    return this.leavesService.reject(id, req.user.employeeId, dto);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.leavesService.cancel(id, req.user.employeeId);
  }

  @Patch(':id/cancel-approved')
  async cancelApproved(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.leavesService.cancelApproved(id, req.user.employeeId);
  }

  // Leave Type Config
  @Post('types')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  createLeaveType(@Body() dto: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(dto);
  }

  @Get('types/:companyId')
  getLeaveTypes(@Param('companyId') companyId: string) {
    return this.leavesService.findAllLeaveTypes(companyId);
  }

  @Patch('types/:uuid')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  updateLeaveType(@Param('uuid') uuid: string, @Body() dto: Partial<CreateLeaveTypeDto>) {
    return this.leavesService.updateLeaveType(uuid, dto);
  }

  @Delete('types/:uuid')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ADMIN)
  removeLeaveType(@Param('uuid') uuid: string) {
    return this.leavesService.removeLeaveType(uuid);
  }
}
