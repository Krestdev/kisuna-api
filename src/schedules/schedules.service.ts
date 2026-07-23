import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { EmployeeSchedule } from 'generated/prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(dto: CreateScheduleDto) {
    // 1. Verify employee exists and is active
    const employee = await this.prisma.employee.findUnique({
      where: { uuid: dto.employeeId },
    });
    if (!employee || !employee.isActive) {
      throw new NotFoundException('Employee not found or inactive');
    }

    // 2. Validate shiftEnd is after shiftStart
    if (dto.shiftEnd <= dto.shiftStart) {
      throw new BadRequestException('shiftEnd must be after shiftStart');
    }

    // 3. Validate workDays format
    const VALID_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const days = dto.workDays.split(',').map((d) => d.trim().toUpperCase());
    const invalid = days.filter((d) => !VALID_DAYS.includes(d));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid work days: ${invalid.join(', ')}. Use MON,TUE,WED,THU,FRI,SAT,SUN`,
      );
    }

    const newStartDate = new Date(dto.startDate);

    // 4. Find any existing active schedule
    const existing = await this.prisma.employeeSchedule.findFirst({
      where: { employeeId: dto.employeeId, status: 'ACTIVE' },
    });

    // Reject only genuinely ambiguous input: same startDate or new start falls inside a future-starting active schedule
    if (existing && existing.startDate >= newStartDate) {
      throw new BadRequestException(
        'New schedule startDate must be after the existing active schedule startDate',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Expire the existing active schedule, closing it the day before the new one starts
      if (existing) {
        const expireDate = new Date(newStartDate);
        expireDate.setDate(expireDate.getDate() - 1);
        await prisma.employeeSchedule.update({
          where: { uuid: existing.uuid },
          data: { endDate: expireDate, status: 'EXPIRED' },
        });
      }

      return prisma.employeeSchedule.create({
        data: {
          employeeId: dto.employeeId,
          startDate: newStartDate,
          endDate: new Date(dto.endDate),
          shiftStart: dto.shiftStart,
          shiftEnd: dto.shiftEnd,
          workDays: days.join(','),
        },
        include: { employee: true },
      });
    });
  }

  async findOne(uuid: string) {
    const schedule = await this.prisma.employeeSchedule.findUnique({
      where: { uuid },
      include: { employee: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.employeeSchedule.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getActiveSchedule(employeeId: string) {
    const today = new Date();
    return this.prisma.employeeSchedule.findFirst({
      where: {
        employeeId,
        status: 'ACTIVE',
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });
  }

  async update(uuid: string, dto: UpdateScheduleDto) {
    const data: Partial<
      Pick<
        EmployeeSchedule,
        | 'startDate'
        | 'endDate'
        | 'shiftStart'
        | 'shiftEnd'
        | 'workDays'
        | 'status'
      >
    > = {};
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.shiftStart) data.shiftStart = dto.shiftStart;
    if (dto.shiftEnd) data.shiftEnd = dto.shiftEnd;
    if (dto.status) data.status = dto.status;
    if (dto.workDays) {
      const days = dto.workDays.split(',').map((d) => d.trim().toUpperCase());
      data.workDays = days.join(',');
    }

    return this.prisma.employeeSchedule.update({
      where: { uuid },
      data,
      include: { employee: true },
    });
  }

  async remove(uuid: string) {
    await this.findOne(uuid);
    return this.prisma.employeeSchedule.delete({ where: { uuid } });
  }

  // Called by cron job
  async expireOutdatedSchedules() {
    const today = new Date();
    const result = await this.prisma.employeeSchedule.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: today },
      },
      data: { status: 'EXPIRED' },
    });
    return result.count;
  }
}
