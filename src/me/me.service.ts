import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AttendanceStatus, LeaveStatus } from '@prisma/client';
import { GetLeavesDto } from './dto/get-leaves.dto';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RustfsService } from '../rustfs/rustfs.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MeService {
  constructor(
    private prisma: DatabaseService,
    private rustfs: RustfsService,
  ) {}

  async getDashboard(employeeId: string) {
    const [leaveBalance, leaveConsumed, lastPayslip] = await Promise.all([
      this.getLeaveBalance(employeeId),
      this.getLeaveConsumed(employeeId),
      this.getLastPayslip(employeeId),
    ]);

    return {
      leaveBalance,
      leaveConsumed,
      lastPayslip,
    };
  }

  private async getLeaveBalance(employeeId: string) {
    const year = new Date().getFullYear();
    let balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    if (!balance) {
      balance = await this.prisma.leaveBalance.create({
        data: { employeeId, year, totalDays: 21, remainingDays: 21 },
      });
    }

    return {
      remainingDays: balance.remainingDays,
      year: balance.year,
    };
  }

  private async getLeaveConsumed(employeeId: string) {
    const year = new Date().getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    if (!balance) {
      return { usedDays: 0, percentageUsed: 0 };
    }

    const percentageUsed = balance.totalDays > 0 
      ? Math.round((balance.usedDays / balance.totalDays) * 100)
      : 0;

    return {
      usedDays: balance.usedDays,
      percentageUsed,
    };
  }

  private async getLastPayslip(employeeId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { employeeId },
      orderBy: { issueDate: 'desc' },
      include: {
        payroll: {
          select: { endDate: true },
        },
      },
    });

    if (!payslip) {
      return null;
    }

    const endDate = payslip.payroll.endDate;
    const period = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

    const totalBulletins = await this.prisma.payslip.count({
      where: {
        payroll: {
          endDate: {
            gte: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
            lt: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1),
          },
        },
      },
    });

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    return {
      period,
      label: `${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`,
      totalBulletins,
      payslipId: payslip.uuid,
    };
  }

  async getAttendance(employeeId: string, query: GetAttendanceDto) {
    const { statuses, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { employeeId };

    if (statuses && statuses.length > 0) {
      where.status = { in: statuses as AttendanceStatus[] };
    }

    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) where.checkIn.gte = new Date(startDate);
      if (endDate) where.checkIn.lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkIn: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    if (attendances.length === 0) {
      return { data: [], meta: { page, limit, totalPages: 0 } };
    }

    const leaves = await this.prisma.leave.findMany({
      where: {
        employeeId,
        status: LeaveStatus.APPROVED,
        startDate: { lte: new Date(Math.max(...attendances.map(a => a.checkIn.getTime()))) },
        endDate: { gte: new Date(Math.min(...attendances.map(a => a.checkIn.getTime()))) },
      },
    });

    return {
      data: attendances.map((attendance) => {
        const date = attendance.checkIn.toISOString().split('T')[0];
        const onLeave = leaves.some(leave => {
          const start = leave.startDate.toISOString().split('T')[0];
          const end = leave.endDate.toISOString().split('T')[0];
          return date >= start && date <= end;
        });

        return {
          date,
          present: attendance.status === AttendanceStatus.PRESENT,
          late: attendance.status === AttendanceStatus.LATE,
          absent: attendance.status === AttendanceStatus.ABSENT,
          exceptional: false,
          field: false,
          onLeave,
          arrivalTime: attendance.checkIn.toTimeString().substring(0, 5),
        };
      }),
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentLeaves(employeeId: string, limit: number = 5) {
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
        type: leave.type,
      })),
    };
  }

  async getLeaves(employeeId: string, query: GetLeavesDto) {
    const { status, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { employeeId };

    if (status) {
      where.status = status as LeaveStatus;
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    const [leaves, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leave.count({ where }),
    ]);

    return {
      data: leaves.map((leave) => ({
        uuid: leave.uuid,
        issueDate: leave.createdAt.toISOString().split('T')[0],
        startDate: leave.startDate.toISOString().split('T')[0],
        endDate: leave.endDate.toISOString().split('T')[0],
        status: leave.status,
        reason: leave.reason,
      })),
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createLeave(employeeId: string, dto: CreateLeaveDto, file?: Express.Multer.File) {
    let justificatifUrl = '';

    if (file) {
      justificatifUrl = await this.rustfs.uploadFile(file, 'leaves');
    }

    const leave = await this.prisma.leave.create({
      data: {
        employeeId,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.observation,
        justificatifUrl,
        status: LeaveStatus.PENDING,
      },
    });

    return {
      uuid: leave.uuid,
      status: leave.status,
      createdAt: leave.createdAt.toISOString(),
      justificatifUrl,
    };
  }

  async fieldPresence(employeeId: string, dto: any) {
    const attendance = await this.prisma.attendance.create({
      data: {
        employeeId,
        checkIn: new Date(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: AttendanceStatus.FIELD,
        location: dto.location,
        mission: dto.mission,
        observations: dto.observations,
      },
    });

    return {
      uuid: attendance.uuid,
      date: attendance.checkIn.toISOString().split('T')[0],
      status: attendance.status,
      createdAt: attendance.checkIn.toISOString(),
    };
  }

  async getProfile(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { uuid: employeeId },
      include: {
        positions: { include: { department: true } },
        user: { select: { email: true } },
      },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const position = employee.positions[0];
    const manager = position?.department?.employeeUuid
      ? await this.prisma.employee.findUnique({
          where: { uuid: position.department.employeeUuid },
          select: { firstName: true, lastName: true },
        })
      : null;

    return {
      uuid: employee.uuid,
      fullName: `${employee.lastName} ${employee.firstName}`,
      grade: 'N/A',
      position: position?.title || 'N/A',
      avatarUrl: '',

      personalInfo: {
        lastName: employee.lastName,
        firstName: employee.firstName,
        birthday: employee.birthday?.toISOString().split('T')[0],
        gender: employee.gender,
        nationality: null,
        countryOfResidence: null,
        address: employee.address,
        phoneNumber: employee.phoneNumber?.toString(),
        email: employee.user?.email || '',
        matrimonialStatus: employee.matrimonial_status,
        numberOfChildren: employee.number_of_children,
        emergencyContactPhone: employee.EmergencyContactPhone?.toString(),
      },

      administrativeInfo: {
        cnpsNumber: employee.CNPSNumber?.toString(),
        idDocumentType: null,
        idDocumentNumber: null,
        idDocumentIssueDate: null,
        idDocumentExpiryDate: null,
        idDocumentIssuePlace: null,
        idDocumentFileUrl: '',
      },

      professionalInfo: {
        position: position?.title || 'N/A',
        department: position?.department?.name || 'N/A',
        manager: manager ? `${manager.firstName} ${manager.lastName}` : 'N/A',
        category: 'N/A',
      },
    };
  }

  async changePassword(userUuid: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { uuid: userUuid },
      data: { passwordHash: hashedPassword },
    });

    return {
      message: 'Mot de passe mis à jour avec succès',
    };
  }
}
