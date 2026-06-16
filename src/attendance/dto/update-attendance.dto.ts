import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ 
    description: 'Check-in timestamp',
    example: '2026-06-16T08:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ 
    description: 'Check-out timestamp',
    example: '2026-06-16T17:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ 
    description: 'Attendance status',
    enum: AttendanceStatus,
    example: 'PRESENT'
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
