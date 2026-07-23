<<<<<<< HEAD
import {  Injectable,  BadRequestException,  NotFoundException,} from '@nestjs/common';import { DatabaseService } from '../database/database.service';import { AttendanceService } from '../attendance/attendance.service';import { SchedulesService } from '../schedules/schedules.service';import { startOfMonth, endOfMonth } from 'date-fns';import { AdjustPayrollDto } from './dto/adjust-payroll.dto';import { LeaveStatus } from '../../generated/prisma/client';const DAY_MAP: Record<string, number> = {  SUN: 0,  MON: 1,  TUE: 2,  WED: 3,  THU: 4,  FRI: 5,  SAT: 6,};@Injectable()export class PayrollsService {  constructor(    private readonly prisma: DatabaseService,    private readonly attendanceService: AttendanceService,    private readonly schedulesService: SchedulesService,  ) {}  async generatePayroll(employeeId: string, month: number, year: number) {    const startDate = startOfMonth(new Date(year, month - 1));    const endDate = endOfMonth(new Date(year, month - 1));    // 1. Check no payroll exists for this period    const existing = await this.prisma.payroll.findFirst({      where: {        employeeId,        startDate: { gte: startDate },        endDate: { lte: endDate },      },    });    if (existing) {      throw new BadRequestException('Payroll already exists for this period');    }    // 2. Get active contract for salary info    const contract = await this.prisma.contract.findFirst({      where: { employeeId, status: 'ACTIVE' },    });    if (!contract) {      throw new BadRequestException('No active contract found');    }    // 3. Get active schedule for dynamic working-day calculation    const schedule = await this.schedulesService.getActiveSchedule(employeeId);    const workDaysList = schedule      ? schedule.workDays.split(',')      : ['MON', 'TUE', 'WED', 'THU', 'FRI'];    // 4. Get attendance summary for the month    const summary = await this.attendanceService.getMonthlySummary(      employeeId,      month,      year,    );    // 4.5. Get approved leaves for this period    const leaves = await this.prisma.leave.findMany({      where: {        employeeId,        status: LeaveStatus.APPROVED,        startDate: { gte: startDate },        endDate: { lte: endDate },      },      include: { leaveTypeConfig: true },    });    // Calculate leave days by type    let unpaidLeaveDays = 0;    for (const leave of leaves) {      const leaveDays =        Math.ceil(          (leave.endDate.getTime() - leave.startDate.getTime()) /            (1000 * 60 * 60 * 24),        ) + 1;      if (leave.leaveTypeConfig?.label?.toUpperCase() === 'UNPAID') {        unpaidLeaveDays += leaveDays;      }    }    // 5. Calculate pay using schedule-aware daily/hourly rates    const OVERTIME_RATE = 1.5;    const expectedDays = this.countWorkingDays(      startDate,      endDate,      workDaysList,    );    const DAILY_RATE = contract.baseSalary / (expectedDays || 26);    const HOURLY_RATE = DAILY_RATE / 8;    const overtimePay = summary.totalOvertime * HOURLY_RATE * OVERTIME_RATE;    // Deduct only absent days + unpaid leave days (paid leave = no deduction)    const deductions = (summary.absentDays + unpaidLeaveDays) * DAILY_RATE;    const netSalary = contract.baseSalary + overtimePay - deductions;    // 5. Create payroll record    const payroll = await this.prisma.payroll.create({      data: {        employeeId,        contractId: contract.uuid,        startDate,        endDate,        baseSalary: contract.baseSalary,        overtimePay,        deductions,        netSalary,        workedDays: summary.presentDays + summary.lateDays + summary.halfDays,        absentDays: summary.absentDays,        overtimeHours: summary.totalOvertime,        status: 'DRAFT',      },    });    // 6. Link attendance records to this payroll    await this.prisma.attendance.updateMany({      where: {        employeeId,        checkIn: { gte: startDate, lte: endDate },        payrollUuid: null,      },      data: {        payrollUuid: payroll.uuid,      },    });    return payroll;  }  async findAll() {    return this.prisma.payroll.findMany({      include: { employee: true, contract: true },      orderBy: { createdAt: 'desc' },    });  }  async findOne(uuid: string) {    const payroll = await this.prisma.payroll.findUnique({      where: { uuid },      include: {        employee: true,        contract: true,        attendances: true,        payslip: true,      },    });    if (!payroll) throw new NotFoundException('Payroll not found');    return payroll;  }  async adjustPayroll(uuid: string, dto: AdjustPayrollDto) {    const payroll = await this.findOne(uuid);    if (payroll.status !== 'DRAFT') {      throw new BadRequestException('Only DRAFT payrolls can be adjusted');    }    const bonus = dto.bonus ?? payroll.bonus;    const deductions = dto.deductions ?? payroll.deductions;    const netSalary =      payroll.baseSalary + payroll.overtimePay + bonus - deductions;    return this.prisma.payroll.update({      where: { uuid },      data: { bonus, deductions, netSalary },    });  }  async approvePayroll(uuid: string) {    const payroll = await this.findOne(uuid);    if (payroll.status !== 'PENDING' && payroll.status !== 'DRAFT') {      throw new BadRequestException(        'Only DRAFT or PENDING payrolls can be approved',      );    }    return this.prisma.payroll.update({      where: { uuid },      data: { status: 'APPROVED' },    });  }  async markPaid(uuid: string) {    const payroll = await this.findOne(uuid);    if (payroll.status !== 'APPROVED') {      throw new BadRequestException(        'Only APPROVED payrolls can be marked as paid',      );    }    return this.prisma.payroll.update({      where: { uuid },      data: { status: 'PAID' },    });  }  async remove(uuid: string) {    const payroll = await this.findOne(uuid);    if (payroll.status !== 'DRAFT') {      throw new BadRequestException('Only DRAFT payrolls can be deleted');    }    // Unlink attendances    await this.prisma.attendance.updateMany({      where: { payrollUuid: uuid },      data: { payrollUuid: null },    });    return this.prisma.payroll.delete({      where: { uuid },    });  }  async findByEmployee(employeeId: string) {    return this.prisma.payroll.findMany({      where: { employeeId },      orderBy: { createdAt: 'desc' },    });  }  async findByPeriod(month: number, year: number) {    const startDate = startOfMonth(new Date(year, month - 1));    const endDate = endOfMonth(new Date(year, month - 1));    return this.prisma.payroll.findMany({      where: {        startDate: { gte: startDate },        endDate: { lte: endDate },      },      include: { employee: true },      orderBy: { createdAt: 'desc' },    });  }  private countWorkingDays(start: Date, end: Date, workDays: string[]): number {    const allowedDays = workDays      .map((d) => DAY_MAP[d.trim()])      .filter((n) => n !== undefined);    let count = 0;    const current = new Date(start);    while (current <= end) {      if (allowedDays.includes(current.getDay())) count++;      current.setDate(current.getDate() + 1);    }    return count;  }}
=======
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { AttendanceService } from '../attendance/attendance.service';

import { SchedulesService } from '../schedules/schedules.service';

import { startOfMonth, endOfMonth } from 'date-fns';

import { AdjustPayrollDto } from './dto/adjust-payroll.dto';

import { LeaveStatus } from '../../generated/prisma/client';

const DAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

@Injectable()
export class PayrollsService {
  constructor(
    private readonly prisma: DatabaseService,

    private readonly attendanceService: AttendanceService,

    private readonly schedulesService: SchedulesService,
  ) {}

  async generatePayroll(employeeId: string, month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));

    const endDate = endOfMonth(new Date(year, month - 1));

    // 1. Check no payroll exists for this period

    const existing = await this.prisma.payroll.findFirst({
      where: {
        employeeId,

        startDate: { gte: startDate },

        endDate: { lte: endDate },
      },
    });

    if (existing) {
      throw new BadRequestException('Payroll already exists for this period');
    }

    // 2. Get active contract for salary info

    const contract = await this.prisma.contract.findFirst({
      where: { employeeId, status: 'ACTIVE' },
    });

    if (!contract) {
      throw new BadRequestException('No active contract found');
    }

    // 3. Get active schedule for dynamic working-day calculation

    const schedule = await this.schedulesService.getActiveSchedule(employeeId);

    const workDaysList = schedule
      ? schedule.workDays.split(',')
      : ['MON', 'TUE', 'WED', 'THU', 'FRI'];

    // 4. Get attendance summary for the month

    const summary = await this.attendanceService.getMonthlySummary(
      employeeId,

      month,

      year,
    );

    // 4.5. Get approved leaves for this period

    const leaves = await this.prisma.leave.findMany({
      where: {
        employeeId,

        status: LeaveStatus.APPROVED,

        startDate: { gte: startDate },

        endDate: { lte: endDate },
      },

      include: { leaveTypeConfig: true },
    });

    // Calculate leave days by type

    let unpaidLeaveDays = 0;

    for (const leave of leaves) {
      const leaveDays =
        Math.ceil(
          (leave.endDate.getTime() - leave.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      if (leave.leaveTypeConfig?.label?.toUpperCase() === 'UNPAID') {
        unpaidLeaveDays += leaveDays;
      }
    }

    // 5. Calculate pay using schedule-aware daily/hourly rates

    const OVERTIME_RATE = 1.5;

    const expectedDays = this.countWorkingDays(
      startDate,

      endDate,

      workDaysList,
    );

    const DAILY_RATE = contract.baseSalary / (expectedDays || 26);

    const HOURLY_RATE = DAILY_RATE / 8;

    const overtimePay = summary.totalOvertime * HOURLY_RATE * OVERTIME_RATE;

    // Deduct only absent days + unpaid leave days (paid leave = no deduction)

    const deductions = (summary.absentDays + unpaidLeaveDays) * DAILY_RATE;

    const netSalary = contract.baseSalary + overtimePay - deductions;

    // 5. Create payroll record

    const payroll = await this.prisma.payroll.create({
      data: {
        employeeId,

        contractId: contract.uuid,

        startDate,

        endDate,

        baseSalary: contract.baseSalary,

        overtimePay,

        deductions,

        netSalary,

        workedDays: summary.presentDays + summary.lateDays + summary.halfDays,

        absentDays: summary.absentDays,

        overtimeHours: summary.totalOvertime,

        status: 'DRAFT',
      },
    });

    // 6. Link attendance records to this payroll

    await this.prisma.attendance.updateMany({
      where: {
        employeeId,

        checkIn: { gte: startDate, lte: endDate },

        payrollUuid: null,
      },

      data: {
        payrollUuid: payroll.uuid,
      },
    });

    return payroll;
  }

  async findAll() {
    return this.prisma.payroll.findMany({
      include: { employee: true, contract: true },

      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { uuid },

      include: {
        employee: true,

        contract: true,

        attendances: true,

        payslip: true,
      },
    });

    if (!payroll) throw new NotFoundException('Payroll not found');

    return payroll;
  }

  async adjustPayroll(uuid: string, dto: AdjustPayrollDto) {
    const payroll = await this.findOne(uuid);

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT payrolls can be adjusted');
    }

    const bonus = dto.bonus ?? payroll.bonus;

    const deductions = dto.deductions ?? payroll.deductions;

    const netSalary =
      payroll.baseSalary + payroll.overtimePay + bonus - deductions;

    return this.prisma.payroll.update({
      where: { uuid },

      data: { bonus, deductions, netSalary },
    });
  }

  async approvePayroll(uuid: string) {
    const payroll = await this.findOne(uuid);

    if (payroll.status !== 'PENDING' && payroll.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only DRAFT or PENDING payrolls can be approved',
      );
    }

    return this.prisma.payroll.update({
      where: { uuid },

      data: { status: 'APPROVED' },
    });
  }

  async markPaid(uuid: string) {
    const payroll = await this.findOne(uuid);

    if (payroll.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only APPROVED payrolls can be marked as paid',
      );
    }

    return this.prisma.payroll.update({
      where: { uuid },

      data: { status: 'PAID' },
    });
  }

  async remove(uuid: string) {
    const payroll = await this.findOne(uuid);

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT payrolls can be deleted');
    }

    // Unlink attendances

    await this.prisma.attendance.updateMany({
      where: { payrollUuid: uuid },

      data: { payrollUuid: null },
    });

    return this.prisma.payroll.delete({
      where: { uuid },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.payroll.findMany({
      where: { employeeId },

      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPeriod(month: number, year: number) {
    const startDate = startOfMonth(new Date(year, month - 1));

    const endDate = endOfMonth(new Date(year, month - 1));

    return this.prisma.payroll.findMany({
      where: {
        startDate: { gte: startDate },

        endDate: { lte: endDate },
      },

      include: { employee: true },

      orderBy: { createdAt: 'desc' },
    });
  }

  private countWorkingDays(start: Date, end: Date, workDays: string[]): number {
    const allowedDays = workDays

      .map((d) => DAY_MAP[d.trim()])

      .filter((n) => n !== undefined);

    let count = 0;

    const current = new Date(start);

    while (current <= end) {
      if (allowedDays.includes(current.getDay())) count++;

      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
>>>>>>> 41fdb51806e04879018d5df3dc3a4b9ec48c865c
