import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { RequestLeaveDto } from './dto/request-leave.dto';

import { RejectLeaveDto } from './dto/reject-leave.dto';

import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';

import {
  calculateWorkingDays,
  getWorkingDays,
} from '../common/utils/working-days.util';

import { LeaveStatus } from '../../generated/prisma/client';

import { SchedulesService } from '../schedules/schedules.service';
import { FindAllLeaveDto } from './dto/find-all-leave.dto';

@Injectable()
export class LeavesService {
  constructor(
    private prisma: DatabaseService,

    private schedulesService: SchedulesService,
  ) {}

  async requestLeave(employeeId: string, dto: RequestLeaveDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { uuid: employeeId },
    });

    if (!employee || !employee.isActive)
      throw new NotFoundException('Employee not found or inactive');

    const leaveType = await this.prisma.leaveTypeConfig.findUnique({
      where: { uuid: dto.leaveTypeConfigId },
    });

    if (!leaveType || !leaveType.isActive)
      throw new NotFoundException('Leave type not found or inactive');

    const startDate = new Date(dto.startDate);

    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + leaveType.daysAllowed - 1);

    await this.checkLeaveBalance(employeeId, leaveType.daysAllowed);

    return this.prisma.leave.create({
      data: {
        employeeId,

        leaveTypeConfigId: dto.leaveTypeConfigId,

        startDate,

        endDate,

        reason: dto.reason,
      },

      include: { employee: true, leaveTypeConfig: true },
    });
  }

  private async checkLeaveBalance(employeeId: string, requestedDays: number) {
    const year = new Date().getFullYear();

    let balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    if (!balance) {
      balance = await this.prisma.leaveBalance.create({
        data: { employeeId, year, totalDays: 21, remainingDays: 21 },
      });
    }

    if (balance.remainingDays < requestedDays) {
      throw new BadRequestException(
        `Insufficient leave balance. Remaining: ${balance.remainingDays} days`,

        `Insufficient leave balance. Remaining: ${balance.remainingDays} days`,
      );
    }
  }

  async findAll({
    page = 1,
    limit = 10,
    employeeId,
    status,
    startDate,
    endDate,
  }: FindAllLeaveDto) {
    const data = await this.prisma.leave.findMany({
      include: { employee: true },
      where: {
        employeeId,
        status,
        startDate: startDate && {
          gte: new Date(startDate),
        },
        endDate: endDate && {
          lte: new Date(endDate),
        },
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total: data.length,
      },
    };
  }

  async getRecent(limit: number = 5) {
    const leaves = await this.prisma.leave.findMany({
      take: limit,

      include: {
        employee: {
          select: {
            uuid: true,

            firstName: true,

            lastName: true,
          },
        },
      },

      orderBy: { createdAt: 'desc' },
    });

    return {
      data: leaves.map((leave) => ({
        uuid: leave.uuid,

        employee: {
          uuid: leave.employee.uuid,

          firstName: leave.employee.firstName,

          lastName: leave.employee.lastName,
        },

        startDate: leave.startDate.toISOString().split('T')[0],

        endDate: leave.endDate.toISOString().split('T')[0],

        status: leave.status,
      })),
    };
  }

  async findOne(id: number) {
    const leave = await this.prisma.leave.findUnique({
      where: { uuid: id },

      include: { employee: true },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    return leave;
  }

  async approve(id: number, approvedBy: string, userRole: string) {
    const leave = await this.findOne(id);

    // Manager (SUPER_ADMIN) approves first

    // if (userRole === 'SUPER_ADMIN' && leave.status === LeaveStatus.PENDING_MANAGER) {

    //   return this.prisma.leave.update({

    //     where: { uuid: id },

    //     data: { status: LeaveStatus.PENDING_HR, approvedBy },

    //     include: { employee: true },

    //   });

    // }

    // HR (ADMIN) approves second and finalizes

    // if (userRole === 'SUPER_ADMIN' && leave.status === LeaveStatus.PENDING_HR) {

    if (
      (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') &&
      leave.status !== LeaveStatus.APPROVED
    ) {
      const schedule = await this.schedulesService.getActiveSchedule(
        leave.employeeId,
      );

      if (!schedule) {
        throw new BadRequestException(
          'No active schedule found for employee — cannot calculate leave days',
        );
      }

      const scheduleWorkDays = schedule.workDays.split(',');

      const workingDays = calculateWorkingDays(leave.startDate, leave.endDate);

      const year = leave.startDate.getFullYear();

      const balance = await this.prisma.leaveBalance.findUnique({
        where: { employeeId_year: { employeeId: leave.employeeId, year } },
      });

      if (balance) {
        await this.prisma.leaveBalance.update({
          where: { uuid: balance.uuid },

          data: {
            usedDays: { increment: workingDays },

            remainingDays: { decrement: workingDays },
          },
        });
      }

      // Auto-create attendance records only for days in the employee's real schedule

      const days = getWorkingDays(leave.startDate, leave.endDate).filter(
        ({ date }) => {
          const dow = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][
            date.getDay()
          ];

          return scheduleWorkDays.includes(dow);
        },
      );

      for (const { date, isHalfDay } of days) {
        const existing = await this.prisma.attendance.findFirst({
          where: {
            employeeId: leave.employeeId,

            checkIn: {
              gte: new Date(date.setHours(0, 0, 0, 0)),

              lte: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
        });

        if (!existing) {
          await this.prisma.attendance.create({
            data: {
              employeeId: leave.employeeId,

              checkIn: new Date(new Date(date).setHours(8, 0, 0, 0)),

              checkOut: new Date(
                new Date(date).setHours(isHalfDay ? 12 : 17, 0, 0, 0),
              ),

              latitude: 0,

              longitude: 0,

              workedHour: isHalfDay ? 4 : 9,

              status: ['ON_LEAVE'],
            },
          });
        }
      }

      return this.prisma.leave.update({
        where: { uuid: id },

        data: { status: LeaveStatus.APPROVED, approvedBy },

        include: { employee: true },
      });
    }

    throw new BadRequestException(
      'Invalid approval workflow or insufficient permissions',
    );

    throw new BadRequestException(
      'Invalid approval workflow or insufficient permissions',
    );
  }

  async reject(id: number, approvedBy: string, dto: RejectLeaveDto) {
    const leave = await this.findOne(id);

    const validStatuses: LeaveStatus[] = [
      LeaveStatus.PENDING_MANAGER,

      LeaveStatus.PENDING_HR,
    ];

    if (!validStatuses.includes(leave.status)) {
      throw new BadRequestException(
        'Only pending leave requests can be rejected',
      );
    }

    return this.prisma.leave.update({
      where: { uuid: id },

      data: {
        status: LeaveStatus.REJECTED,

        approvedBy,

        rejectReason: dto.rejectReason,
      },

      include: { employee: true },
    });
  }

  async cancel(id: number, employeeId: string) {
    const leave = await this.findOne(id);

    if (leave.employeeId !== employeeId) {
      throw new ForbiddenException(
        'You can only cancel your own leave requests',
      );
    }

    const validStatuses: LeaveStatus[] = [
      LeaveStatus.PENDING_MANAGER,

      LeaveStatus.PENDING_HR,
    ];

    if (!validStatuses.includes(leave.status)) {
      throw new BadRequestException(
        'Only pending leave requests can be cancelled',
      );
    }

    return this.prisma.leave.update({
      where: { uuid: id },

      data: { status: LeaveStatus.CANCELLED },

      include: { employee: true },
    });
  }

  async cancelApproved(id: number, employeeId: string) {
    const leave = await this.findOne(id);

    if (leave.employeeId !== employeeId) {
      throw new ForbiddenException(
        'You can only cancel your own leave requests',
      );
    }

    if (leave.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved leave requests can be cancelled here',
      );
    }

    const leaveDays =
      Math.ceil(
        (leave.endDate.getTime() - leave.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    const year = leave.startDate.getFullYear();

    const balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId: leave.employeeId, year } },
    });

    if (balance) {
      await this.prisma.leaveBalance.update({
        where: { uuid: balance.uuid },

        data: {
          usedDays: { decrement: leaveDays },

          remainingDays: { increment: leaveDays },
        },
      });
    }

    return this.prisma.leave.update({
      where: { uuid: id },

      data: { status: LeaveStatus.CANCELLED },

      include: { employee: true },
    });
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.leave.findMany({
      where: { employeeId },

      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeaveBalance(employeeId: string) {
    const currentYear = new Date().getFullYear();

    let balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year: currentYear } },
    });

    if (!balance) {
      balance = await this.prisma.leaveBalance.create({
        data: {
          employeeId,

          year: currentYear,

          totalDays: 21,

          remainingDays: 21,
        },
      });
    }

    return {
      year: balance.year,

      total: balance.totalDays,

      used: balance.usedDays,

      remaining: balance.remainingDays,
    };
  }

  async checkIfOnLeave(employeeId: string, date: Date = new Date()) {
    return this.prisma.leave.findFirst({
      where: {
        employeeId,

        status: LeaveStatus.APPROVED,

        startDate: { lte: date },

        endDate: { gte: date },
      },
    });
  }

  async initializeBalanceForYear(
    employeeId: string,

    year: number,

    totalDays: number = 21,
  ) {
    const existing = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    if (existing) {
      throw new BadRequestException('Balance already exists for this year');
    }

    return this.prisma.leaveBalance.create({
      data: {
        employeeId,

        year,

        totalDays,

        usedDays: 0,

        remainingDays: totalDays,
      },
    });
  }

  async updateBalanceQuota(
    employeeId: string,

    year: number,

    totalDays: number,
  ) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    if (!balance) {
      throw new NotFoundException('Balance record not found for this year');
    }

    const difference = totalDays - balance.totalDays;

    return this.prisma.leaveBalance.update({
      where: { uuid: balance.uuid },

      data: {
        totalDays,

        remainingDays: balance.remainingDays + difference,
      },
    });
  }

  async getHistory(employeeId: string) {
    const leaves = await this.prisma.leave.findMany({
      where: { employeeId },

      include: {
        employee: {
          select: {
            uuid: true,

            firstName: true,

            lastName: true,
          },
        },
      },

      orderBy: { createdAt: 'desc' },
    });

    return {
      data: leaves.map((leave) => {
        const approver = leave.approvedBy
          ? `${leave.employee.firstName} ${leave.employee.lastName}`
          : null;

        return {
          uuid: leave.uuid,

          startDate: leave.startDate.toISOString().split('T')[0],

          endDate: leave.endDate.toISOString().split('T')[0],

          status: leave.status,

          approvedBy: approver,

          createdAt: leave.createdAt.toISOString(),
        };
      }),
    };
  }

  // Leave Type Config CRUD

  async createLeaveType(dto: CreateLeaveTypeDto) {
    const company = await this.prisma.company.findUnique({
      where: { uuid: dto.companyId },
    });

    if (!company) throw new NotFoundException('Company not found');

    return this.prisma.leaveTypeConfig.create({ data: dto });
  }

  findAllLeaveTypes(companyId: string) {
    return this.prisma.leaveTypeConfig.findMany({
      where: { companyId, isActive: true },
    });
  }

  async updateLeaveType(uuid: string, dto: Partial<CreateLeaveTypeDto>) {
    const existing = await this.prisma.leaveTypeConfig.findUnique({
      where: { uuid },
    });

    if (!existing) throw new NotFoundException('Leave type not found');

    return this.prisma.leaveTypeConfig.update({ where: { uuid }, data: dto });
  }

  async removeLeaveType(uuid: string) {
    const existing = await this.prisma.leaveTypeConfig.findUnique({
      where: { uuid },
    });

    if (!existing) throw new NotFoundException('Leave type not found');

    return this.prisma.leaveTypeConfig.update({
      where: { uuid },

      data: { isActive: false },
    });
  }
}
