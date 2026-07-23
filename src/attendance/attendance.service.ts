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
import { FindAllAttendanceDto } from './dto/find-all-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MarkAbsentDto } from './dto/mark-absent.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import {
  Attendance,
  AttendanceStatus,
  Prisma,
} from '../../generated/prisma/client';

const STANDARD_HOURS = 8;
const GRACE_PERIOD_MINUTES = 15;

const EMPLOYEE_SELECT = {
  uuid: true,
  firstName: true,
  lastName: true,
  position: true,
  user: { select: { email: true } },
} as const;

@Injectable()
export class AttendanceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly schedulesService: SchedulesService,
  ) {}

  private buildAttendanceData(dto: CreateAttendanceDto) {
    const checkIn = new Date(dto.checkIn);
    if (isNaN(checkIn.getTime())) {
      throw new BadRequestException(
        `Invalid checkIn date for employee ${dto.employeeId}`,
      );
    }

    const checkOut = dto.checkOut ? new Date(dto.checkOut) : undefined;
    if (checkOut && isNaN(checkOut.getTime())) {
      throw new BadRequestException(
        `Invalid checkOut date for employee ${dto.employeeId}`,
      );
    }

    if (!dto.status?.length) {
      throw new BadRequestException(
        `status is required for employee ${dto.employeeId}`,
      );
    }

    const workedHour = checkOut
      ? this.calculateHours(checkIn, checkOut)
      : undefined;
    const overtimes =
      workedHour != null ? Math.max(0, workedHour - STANDARD_HOURS) : undefined;

    return {
      employeeId: dto.employeeId,
      checkIn,
      checkOut,
      status: dto.status,
      latitude: dto.latitude ?? 0,
      longitude: dto.longitude ?? 0,
      workedHour,
      overtimes,
    };
  }

  async create(dto: CreateAttendanceDto): Promise<Attendance> {
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
      include: { employee: { select: EMPLOYEE_SELECT } },
    });
  }

  async createMany(dtos: CreateAttendanceDto[]): Promise<Attendance[]> {
    const employeeIds = [...new Set(dtos.map((d) => d.employeeId))];

    const employees = await this.databaseService.employee.findMany({
      where: { uuid: { in: employeeIds } },
      select: { uuid: true },
    });

    const foundIds = new Set(employees.map((e) => e.uuid));
    const missing = employeeIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new NotFoundException(
        `Employee(s) not found: ${missing.join(', ')}`,
      );
    }

    const records = dtos.map((dto) => this.buildAttendanceData(dto));

    return this.databaseService.$transaction(
      records.map((data) =>
        this.databaseService.attendance.create({
          data,
          include: { employee: { select: EMPLOYEE_SELECT } },
        }),
      ),
    );
  }

  // async checkIn(dto: CheckInDto) {
  //   const employee = await this.databaseService.employee.findUnique({
  //     where: { uuid: dto.employeeId },
  //   });
  //   if (!employee || !employee.isActive)
  //     throw new NotFoundException('Employee not found or inactive');

  //   const today = new Date();

  //   const [onLeave, schedule, existing] = await Promise.all([
  //     this.databaseService.leave.findFirst({
  //       where: {
  //         employeeId: dto.employeeId,
  //         status: LeaveStatus.APPROVED,
  //         startDate: { lte: today },
  //         endDate: { gte: today },
  //       },
  //     }),
  //     this.schedulesService.getActiveSchedule(dto.employeeId),
  //     this.databaseService.attendance.findFirst({
  //       where: {
  //         employeeId: dto.employeeId,
  //         checkIn: { gte: startOfDay(today), lte: endOfDay(today) },
  //       },
  //     }),
  //   ]);

  //   if (onLeave)
  //     throw new BadRequestException(
  //       'You are on approved leave today, check-in not required',
  //     );

  //   if (!schedule)
  //     throw new BadRequestException(
  //       'No active schedule found for this employee',
  //     );

  //   const todayAbbr = format(today, 'EEE').toUpperCase();
  //   if (!schedule.workDays.split(',').includes(todayAbbr))
  //     throw new BadRequestException(
  //       `Today (${todayAbbr}) is not a working day for this employee`,
  //     );

  //   if (existing) throw new BadRequestException('Already checked in today');

  //   const status = this.determineStatus(today, schedule.shiftStart);

  //   return this.databaseService.attendance.create({
  //     data: {
  //       employeeId: dto.employeeId,
  //       checkIn: today,
  //       latitude: dto.latitude,
  //       longitude: dto.longitude,
  //       status,
  //     },
  //     include: { employee: { select: EMPLOYEE_SELECT } },
  //   });
  // }

  // async checkOut(dto: CheckOutDto): Promise<Attendance> {
  //   const record = await this.databaseService.attendance.findFirst({
  //     where: {
  //       employeeId: dto.employeeId,
  //       checkOut: null,
  //       checkIn: { gte: startOfDay(new Date()) },
  //     },
  //   });
  //   if (!record)
  //     throw new BadRequestException('No open check-in found for today');

  //   const checkOut = new Date();
  //   const workedHour = this.calculateHours(record.checkIn, checkOut);
  //   const overtimes = Math.max(0, workedHour - STANDARD_HOURS);

  //   return this.databaseService.attendance.update({
  //     where: { uuid: record.uuid },
  //     data: { checkOut, workedHour, overtimes },
  //     include: { employee: { select: EMPLOYEE_SELECT } },
  //   });
  // }

  async findAll({
    page = 1,
    limit = 20,
    employeeId,
    status,
    month,
    year,
  }: FindAllAttendanceDto): Promise<{
    data: Attendance[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const data = await this.databaseService.attendance.findMany({
      where: {
        employeeId,
        status: { has: status },
        ...(month && year
          ? {
              checkIn: {
                gte: startOfMonth(new Date(year, month - 1)),
                lte: endOfMonth(new Date(year, month - 1)),
              },
            }
          : {}),
      },
      skip,
      take: limit,
      orderBy: { checkIn: 'desc' },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    return {
      data,
      meta: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit),
      },
    };
  }

  async findOne(uuid: string): Promise<Attendance> {
    const attendance = await this.databaseService.attendance.findUnique({
      where: { uuid },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    return attendance;
  }

  async findByEmployee(
    employeeId: string,
    {
      month,
      year,
      page = 1,
      limit = 20,
    }: {
      month?: number;
      year?: number;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Attendance[]; total: number }> {
    const where: { employeeId: string; checkIn?: { gte: Date; lte: Date } } = {
      employeeId,
    };
    if (month && year) {
      const date = new Date(year, month - 1);
      where.checkIn = { gte: startOfMonth(date), lte: endOfMonth(date) };
    }

    const data = await this.databaseService.attendance.findMany({
      where,
      orderBy: { checkIn: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    return { data, total: data.length };
  }

  async getMonthlySummary(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<{
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    halfDays: number;
    onLeaveDays: number;
    totalHours: number;
    totalOvertime: number;
  }> {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: employeeId },
      select: { uuid: true },
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const date = new Date(year, month - 1);
    const records = await this.databaseService.attendance.findMany({
      where: {
        employeeId,
        checkIn: { gte: startOfMonth(date), lte: endOfMonth(date) },
      },
      select: {
        status: true,
        workedHour: true,
        overtimes: true,
      },
    });

    return records.reduce(
      (acc, r) => {
        const s = r.status;
        if (s.includes('PRESENT')) acc.presentDays++;
        if (s.includes('LATE')) acc.lateDays++;
        if (s.includes('ABSENT')) acc.absentDays++;
        if (s.includes('HALF_DAY')) acc.halfDays++;
        if (s.includes('ON_LEAVE')) acc.onLeaveDays++;
        acc.totalHours += r.workedHour ?? 0;
        acc.totalOvertime += r.overtimes ?? 0;
        acc.totalDays++;
        return acc;
      },
      {
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        halfDays: 0,
        onLeaveDays: 0,
        totalHours: 0,
        totalOvertime: 0,
      },
    );
  }

  async update(uuid: string, dto: UpdateAttendanceDto) {
    const existing = await this.databaseService.attendance.findUnique({
      where: { uuid },
    });
    if (!existing) throw new NotFoundException('Attendance record not found');
    const data: Prisma.AttendanceUpdateInput = {};

    if (dto.checkIn) data.checkIn = new Date(dto.checkIn);
    if (dto.checkOut) data.checkOut = new Date(dto.checkOut);
    if (dto.status) data.status = dto.status;

    const checkIn = (data.checkIn as Date | undefined) ?? existing.checkIn;
    const checkOut = (data.checkOut as Date | undefined) ?? existing.checkOut;

    // TODO: find way to calculate working hours using the schedule of employees in database not the constant STANDARD_HOURS
    let workedHour: number | undefined;
    if (checkOut && (dto.checkIn || dto.checkOut)) {
      workedHour = this.calculateHours(checkIn, checkOut);
      data.workedHour = workedHour;
      data.overtimes = Math.max(0, workedHour - STANDARD_HOURS);
    }

    if (data.checkIn && !dto.status) {
      const schedule = await this.schedulesService.getActiveSchedule(
        existing.employeeId,
      );
      const shiftStart = schedule?.shiftStart ?? '08:00';
      const shiftEnd = schedule?.shiftEnd ?? '17:00';

      data.status = this.determineStatus(checkIn, shiftStart);

      if (checkOut) {
        const [endH, endM] = shiftEnd.split(':').map(Number);
        const [startH, startM] = shiftStart.split(':').map(Number);
        const shiftEndDate = new Date(checkIn);
        shiftEndDate.setHours(endH, endM, 0, 0);
        const shiftStartDate = new Date(checkIn);
        shiftStartDate.setHours(startH, startM, 0, 0);
        const midpoint = new Date(
          (shiftStartDate.getTime() + shiftEndDate.getTime()) / 2,
        );
        if (checkOut < midpoint) data.status = [AttendanceStatus.HALF_DAY];
      }
    }

    return this.databaseService.attendance.update({
      where: { uuid },
      data,
      include: { employee: { select: EMPLOYEE_SELECT } },
    });
  }

  async markAbsent(dto: MarkAbsentDto): Promise<Attendance> {
    const employee = await this.databaseService.employee.findUnique({
      where: { uuid: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const date = new Date(dto.date);
    const existing = await this.databaseService.attendance.findFirst({
      where: {
        employeeId: dto.employeeId,
        checkIn: { gte: startOfDay(date), lte: endOfDay(date) },
      },
    });
    if (existing)
      throw new BadRequestException(
        'Attendance record already exists for this date',
      );

    return this.databaseService.attendance.create({
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
    return this.databaseService.attendance.delete({ where: { uuid } });
  }

  private calculateHours(checkIn: Date, checkOut: Date): number {
    return parseFloat(
      ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2),
    );
  }

  private determineStatus(checkInTime: Date, shiftStart = '08:00'): string[] {
    const [hours, minutes] = shiftStart.split(':').map(Number);
    const scheduledStart = new Date(checkInTime);
    scheduledStart.setHours(hours, minutes, 0, 0);
    const diffMinutes = differenceInMinutes(checkInTime, scheduledStart);
    return diffMinutes > GRACE_PERIOD_MINUTES
      ? [AttendanceStatus.LATE]
      : [AttendanceStatus.PRESENT];
  }
}
