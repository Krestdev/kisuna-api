import { IsString, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum AttendanceStatus {
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE',
  HALF_DAY = 'HALF_DAY',
}

export class MarkAbsentDto {
  @ApiProperty({ 
    description: 'Employee UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ 
    description: 'Date of absence',
    example: '2026-06-16'
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ 
    description: 'Type of absence',
    enum: AttendanceStatus,
    example: 'ABSENT'
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
