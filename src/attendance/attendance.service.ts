import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  startOfDay,
  endOfDay,
  differenceInMinutes,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { CheckInDto } from './dto/checkin.dto';
import { CheckOutDto } from './dto/checkout.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MarkAbsentDto } from './dto/mark-absent.dto';

const STANDARD_HOURS = 8;
const LATE_THRESHOLD_MINUTES = 15;

@Injectable()
export class AttendanceService {
  constructor(private prisma: DatabaseService) {}

  async checkIn(dto: CheckInDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { uuid: dto.employeeId },
      include: { schedules: true },
    });

    if (!employee || !employee.isActive) {
      throw new NotFoundException('Employee not found or inactive');
    }

    const today = new Date();
    const existing = await this.prisma.attendance.findFirst({
      where: {
        employeeId: dto.employeeId,
        checkIn: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already checked in today');
    }

    const status = this.determineStatus(today, employee.schedules[0]);

    return this.prisma.attendance.create({
      data: {
        employeeId: dto.employeeId,
        checkIn: today,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status,
      },
      include: { employee: true },
    });
  }

  async checkOut(dto: CheckOutDto) {
    const record = await this.prisma.attendance.findFirst({
      where: {
        employeeId: dto.employeeId,
        checkOut: null,
        checkIn: { gte: startOfDay(new Date()) },
      },
    });

    if (!record) {
      throw new BadRequestException('No open check-in found for today');
    }

    const checkOut = new Date();
    const workedHour = this.calculateHours(record.checkIn, checkOut);
    const overtimes = Math.max(0, workedHour - STANDARD_HOURS);

    return this.prisma.attendance.update({
      where: { uuid: record.uuid },
      data: { checkOut, workedHour, overtimes },
      include: { employee: true },
    });
  }

  async findAll(month?: number, year?: number) {
    const where: any = {};

    if (month && year) {
      const date = new Date(year, month - 1);
      where.checkIn = {
        gte: startOfMonth(date),
        lte: endOfMonth(date),
      };
    }

    return this.prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { checkIn: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { uuid },
      include: { employee: true },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async findByEmployee(employeeId: string, month?: number, year?: number) {
    const where: any = { employeeId };

    if (month && year) {
      const date = new Date(year, month - 1);
      where.checkIn = {
        gte: startOfMonth(date),
        lte: endOfMonth(date),
      };
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { checkIn: 'desc' },
    });
  }

  async getMonthlySummary(employeeId: string, month: number, year: number) {
    const date = new Date(year, month - 1);
    const records = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        checkIn: {
          gte: startOfMonth(date),
          lte: endOfMonth(date),
        },
      },
    });

    return {
      totalDays: records.length,
      presentDays: records.filter((r) => r.status === 'PRESENT').length,
      lateDays: records.filter((r) => r.status === 'LATE').length,
      absentDays: records.filter((r) => r.status === 'ABSENT').length,
      halfDays: records.filter((r) => r.status === 'HALF_DAY').length,
      onLeaveDays: records.filter((r) => r.status === 'ON_LEAVE').length,
      totalHours: records.reduce((sum, r) => sum + (r.workedHour ?? 0), 0),
      totalOvertime: records.reduce((sum, r) => sum + (r.overtimes ?? 0), 0),
    };
  }

  async update(uuid: string, dto: UpdateAttendanceDto) {
    await this.findOne(uuid);

    const data: any = {};
    if (dto.checkIn) data.checkIn = new Date(dto.checkIn);
    if (dto.checkOut) data.checkOut = new Date(dto.checkOut);
    if (dto.status) data.status = dto.status;

    if (data.checkIn && data.checkOut) {
      data.workedHour = this.calculateHours(data.checkIn, data.checkOut);
      data.overtimes = Math.max(0, data.workedHour - STANDARD_HOURS);
    }

    return this.prisma.attendance.update({
      where: { uuid },
      data,
      include: { employee: true },
    });
  }

  async markAbsent(dto: MarkAbsentDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { uuid: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const date = new Date(dto.date);
    const existing = await this.prisma.attendance.findFirst({
      where: {
        employeeId: dto.employeeId,
        checkIn: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Attendance record already exists for this date');
    }

    return this.prisma.attendance.create({
      data: {
        employeeId: dto.employeeId,
        checkIn: startOfDay(date),
        latitude: 0,
        longitude: 0,
        status: dto.status,
      },
      include: { employee: true },
    });
  }

  async remove(uuid: string) {
    await this.findOne(uuid);
    return this.prisma.attendance.delete({ where: { uuid } });
  }

  private calculateHours(checkIn: Date, checkOut: Date): number {
    const ms = checkOut.getTime() - checkIn.getTime();
    return parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
  }

  private determineStatus(checkInTime: Date, schedule: any): 'PRESENT' | 'LATE' {
    if (!schedule) return 'PRESENT';

    const scheduledStart = new Date(schedule.startDate);
    scheduledStart.setFullYear(
      checkInTime.getFullYear(),
      checkInTime.getMonth(),
      checkInTime.getDate(),
    );

    const diffMinutes = differenceInMinutes(checkInTime, scheduledStart);

    if (diffMinutes > LATE_THRESHOLD_MINUTES) return 'LATE';
    return 'PRESENT';
  }
}
