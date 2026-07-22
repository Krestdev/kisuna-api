import { Injectable, Logger } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { DatabaseService } from '../../database/database.service';

import {
  LeaveStatus,
  AttendanceStatus,
} from '../../../generated/prisma/client';

import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class LeaveCronService {
  private readonly logger = new Logger(LeaveCronService.name);

  constructor(private prisma: DatabaseService) {}

  @Cron('0 1 * * *') // 1am daily
  async markLeaveDays() {
    this.logger.log('Running daily leave attendance marking');

    const today = startOfDay(new Date());

    const approvedLeaves = await this.prisma.leave.findMany({
      where: {
        status: LeaveStatus.APPROVED,

        startDate: { lte: endOfDay(today) },

        endDate: { gte: today },
      },
    });

    this.logger.log(
      `Found ${approvedLeaves.length} employees on approved leave today`,
    );

    for (const leave of approvedLeaves) {
      const existing = await this.prisma.attendance.findFirst({
        where: {
          employeeId: leave.employeeId,

          checkIn: {
            gte: today,

            lte: endOfDay(today),
          },
        },
      });

      if (!existing) {
        await this.prisma.attendance.create({
          data: {
            employeeId: leave.employeeId,

            checkIn: today,

            latitude: 0,

            longitude: 0,

            status: [AttendanceStatus.ON_LEAVE],
          },
        });

        this.logger.log(`Marked ON_LEAVE for employee ${leave.employeeId}`);
      } else if (!existing.status.includes(AttendanceStatus.ON_LEAVE)) {
        await this.prisma.attendance.update({
          where: { uuid: existing.uuid },

          data: { status: [AttendanceStatus.ON_LEAVE] },
        });

        this.logger.log(`Updated to ON_LEAVE for employee ${leave.employeeId}`);
      }
    }
  }
}
