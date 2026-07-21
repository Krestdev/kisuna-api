import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceUpdateInput } from 'generated/prisma/models';

enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  FIELD = 'FIELD',
}

export class MarkAbsentDto implements Omit<
  AttendanceUpdateInput,
  'id' | 'employee' | 'payroll' | 'createdAt' | 'updatedAt'
> {
  @ApiProperty({
    description: 'Employee UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Date of absence',
    example: '2026-06-16',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    isArray: true,
    example: ['PRESENT', 'FIELD'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AttendanceStatus, { each: true })
  status: AttendanceStatus[] = [AttendanceStatus.ABSENT];
}
