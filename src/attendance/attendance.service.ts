import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SchedulesService } from '../schedules/schedules.service';
import {
  startOfDay,
  endOfDay,
  differenceInMinutes,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { format } from 'date-fns';
import { CheckInDto } from './dto/checkin.dto';
import { CheckOutDto } from './dto/checkout.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MarkAbsentDto } from './dto/mark-absent.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance, AttendanceStatus, LeaveStatus } from '@prisma/client';

const STANDARD_HOURS = 8;
const GRACE_PERIOD_MINUTES = 15;

@Injectable()
export class AttendanceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly schedulesService: SchedulesService,
  ) {}

  async createMany(dtos: CreateAttendanceDto[]) {
    return Promise.all(dtos.map((dto) => this.create(dto)));
  }

  async create(dto: CreateAttendanceDto) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const checkIn = new Date(dto.checkIn);
    if (isNaN(checkIn.getTime()))
      throw new BadRequestException('Invalid checkIn date');

    const checkOut = dto.checkOut ? new Date(dto.checkOut) : undefined;
    if (checkOut && isNaN(checkOut.getTime()))
      throw new BadRequestException('Invalid checkOut date');

    if (!dto.status?.length)
      throw new BadRequestException('status is required');

    const workedHour = checkOut
      ? this.calculateHours(checkIn, checkOut)
      : undefined;
    const overtimes =
      workedHour != null ? Math.max(0, workedHour - STANDARD_HOURS) : undefined;

    return this.databaseService.attendance.create({
      data: {
        employeeId: dto.employeeId,
        checkIn,
        checkOut,
        status: dto.status,
        latitude: dto.latitude ?? 0,
        longitude: dto.longitude ?? 0,
        workedHour,
        overtimes,
      },
      include: {
        employee: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async checkIn(dto: CheckInDto) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: dto.employeeId },
    });

    if (!employee || !employee.isActive) {
      throw new NotFoundException('Employee not found or inactive');
    }

    // Check if employee is on approved leave today
    const today = new Date();
    const onLeave = await this.databaseService.leave.findFirst({
      where: {
        employeeId: dto.employeeId,
        status: LeaveStatus.APPROVED,
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    if (onLeave) {
      throw new BadRequestException(
        'You are on approved leave today, check-in not required',
      );
    }

    // Get active schedule
    const schedule = await this.schedulesService.getActiveSchedule(
      dto.employeeId,
    );
    if (!schedule) {
      throw new BadRequestException(
        'No active schedule found for this employee',
      );
    }

    // Check if today is a valid work day
    const todayAbbr = format(new Date(), 'EEE').toUpperCase(); // MON, TUE...
    const workDays = schedule.workDays.split(',');
    if (!workDays.includes(todayAbbr)) {
      throw new BadRequestException(
        `Today (${todayAbbr}) is not a working day for this employee`,
      );
    }

    const existing = await this.databaseService.attendance.findFirst({
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

    const status = this.determineStatus(today, schedule.shiftStart);

    return this.databaseService.attendance.create({
      data: {
        employeeId: dto.employeeId,
        checkIn: today,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status,
      },
      include: {
        employee: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async checkOut(dto: CheckOutDto): Promise<Attendance> {
    const record = await this.databaseService.attendance.findFirst({
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

    return this.databaseService.attendance.update({
      where: { uuid: record.uuid },
      data: { checkOut, workedHour, overtimes },
      include: {
        employee: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async findAll(month?: number, year?: number, page = 1, limit = 20) {
    const attendanceWhere: any = {};

    if (month && year) {
      const date = new Date(year, month - 1);
      attendanceWhere.checkIn = {
        gte: startOfMonth(date),
        lte: endOfMonth(date),
      };
    }

    const skip = (page - 1) * limit;
    const [employees, total] = await Promise.all([
      this.databaseService.employee.findMany({
        skip,
        take: limit,
        select: {
          uuid: true,
          firstName: true,
          lastName: true,
          position: true,
          user: { select: { email: true } },
          attendances: {
            where: attendanceWhere,
            orderBy: { checkIn: 'desc' },
          },
        },
      }),
      this.databaseService.employee.count(),
    ]);

    return {
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(uuid: string): Promise<Attendance> {
    const attendance = await this.databaseService.attendance.findUnique({
      where: { uuid },
      include: {
        employee: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async findByEmployee(
    employeeId: string,
    month?: number,
    year?: number,
  ): Promise<Attendance[]> {
    const where: any = { employeeId };

    if (month && year) {
      const date = new Date(year, month - 1);
      where.checkIn = {
        gte: startOfMonth(date),
        lte: endOfMonth(date),
      };
    }

    return this.databaseService.attendance.findMany({
      where,
      orderBy: { checkIn: 'desc' },
    });
  }

  async getMonthlySummary(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<any> {
    const date = new Date(year, month - 1);
    const records = await this.databaseService.attendance.findMany({
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
      presentDays: records.filter((r) => r.status.includes('PRESENT')).length,
      lateDays: records.filter((r) => r.status.includes('LATE')).length,
      absentDays: records.filter((r) => r.status.includes('ABSENT')).length,
      halfDays: records.filter((r) => r.status.includes('HALF_DAY')).length,
      onLeaveDays: records.filter((r) => r.status.includes('ON_LEAVE')).length,
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

    return this.databaseService.attendance.update({
      where: { uuid },
      data,
      include: {
        employee: {
          select: {
            uuid: true,
            firstName: true,
            lastName: true,
            position: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async markAbsent(dto: MarkAbsentDto) {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const date = new Date(dto.date);
    const existing = await this.databaseService.attendance.findFirst({
      where: {
        employeeId: dto.employeeId,
        checkIn: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Attendance record already exists for this date',
      );
    }

    return this.databaseService.attendance.create({
      data: {
        employeeId: dto.employeeId,
        checkIn: startOfDay(date),
        latitude: 0,
        longitude: 0,
        status: [dto.status],
      },
      include: { employee: true },
    });
  }

  async remove(uuid: string) {
    await this.findOne(uuid);
    return this.databaseService.attendance.delete({ where: { uuid } });
  }

  private calculateHours(checkIn: Date, checkOut: Date): number {
    const ms = checkOut.getTime() - checkIn.getTime();
    return parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
  }

  private determineStatus(checkInTime: Date, shiftStart: string): string[] {
    const [hours, minutes] = shiftStart.split(':').map(Number);
    const scheduledStart = new Date(checkInTime);
    scheduledStart.setHours(hours, minutes, 0, 0);

    const diffMinutes = differenceInMinutes(checkInTime, scheduledStart);

    if (diffMinutes > GRACE_PERIOD_MINUTES) return [AttendanceStatus.LATE];
    return [AttendanceStatus.PRESENT];
  }
}
