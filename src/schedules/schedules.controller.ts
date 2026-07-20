import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SystemRole } from '@prisma/client';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a schedule for an employee' })
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all schedules' })
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @Roles(SystemRole.EMPLOYEE, SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get one schedule' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a schedule' })
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a schedule' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
