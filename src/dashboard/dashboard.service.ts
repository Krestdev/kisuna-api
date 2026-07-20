import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LeaveStatus } from '@prisma/client';
import { startOfYear, format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class DashboardService {
  constructor(private prisma: DatabaseService) {}

  async getSummary() {
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date());

    const [
      pendingLeaveRequests,
      totalEmployees,
      employeesAddedThisYear,
      lastPayslip,
    ] = await Promise.all([
      this.prisma.leave.count({
        where: {
          status: {
            in: [LeaveStatus.PENDING_MANAGER, LeaveStatus.PENDING_HR],
          },
        },
      }),
      this.prisma.employee.count({
        where: { isActive: true },
      }),
      this.prisma.employee.count({
        where: {
          isActive: true,
          createdAt: { gte: yearStart },
        },
      }),
      this.prisma.payslip.findFirst({
        include: { payroll: true },
        orderBy: { issueDate: 'desc' },
      }),
    ]);

    let lastPayslipInfo: {
      period: string;
      label: string;
      totalBulletins: number;
    } | null = null;

    if (lastPayslip) {
      const payrollMonth = lastPayslip.payroll.startDate;
      const totalBulletins = await this.prisma.payslip.count({
        where: {
          payroll: {
            startDate: {
              gte: new Date(
                payrollMonth.getFullYear(),
                payrollMonth.getMonth(),
                1,
              ),
            },
            endDate: {
              lte: new Date(
                payrollMonth.getFullYear(),
                payrollMonth.getMonth() + 1,
                0,
              ),
            },
          },
        },
      });

      lastPayslipInfo = {
        period: format(payrollMonth, 'yyyy-MM'),
        label: format(payrollMonth, 'MMMM yyyy', { locale: fr }),
        totalBulletins,
      };
    }

    return {
      pendingLeaveRequests,
      totalEmployees,
      employeesAddedThisYear,
      lastPayslip: lastPayslipInfo,
    };
  }
}
