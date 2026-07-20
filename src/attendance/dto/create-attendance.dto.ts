import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { AttendanceStatus } from '@prisma/client';
import { AttendanceCreateInput } from 'generated/prisma/models';

export class CreateAttendanceDto implements Omit<
  AttendanceCreateInput,
  'id' | 'status' | 'employee' | 'createdAt' | 'updatedAt'
> {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: '2026-07-15T08:00:00.000Z' })
  @IsDateString()
  checkIn: string;

  @ApiPropertyOptional({ example: '2026-07-15T17:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @ApiProperty({
    enum: AttendanceStatus,
    isArray: true,
    example: ['PRESENT', 'FIELD'],
  })
  @IsArray()
  @IsEnum(AttendanceStatus, { each: true })
  status: AttendanceStatus[];

  @ApiPropertyOptional({ example: 3.848 })
  @IsNumber()
  @IsOptional()
  latitude: number;

  @ApiPropertyOptional({ example: 11.502 })
  @IsNumber()
  @IsOptional()
  longitude: number;
}
