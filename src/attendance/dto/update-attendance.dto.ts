import { IsArray, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  FIELD = 'FIELD',
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ example: '2026-06-16T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ example: '2026-06-16T17:00:00Z' })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    isArray: true,
    example: ['PRESENT', 'FIELD'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AttendanceStatus, { each: true })
  status?: AttendanceStatus[];
}
