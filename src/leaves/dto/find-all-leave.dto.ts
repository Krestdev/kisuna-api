import { Leave, LeaveStatus } from 'generated/prisma/client';
import { IsOptional, IsEnum, IsDate, IsInt, IsString } from 'class-validator';

export class FindAllLeaveDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;
}
