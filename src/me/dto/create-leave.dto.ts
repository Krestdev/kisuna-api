import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveDto {
  @ApiProperty({
    description: 'Type of leave',
    enum: LeaveType,
    example: 'ANNUAL',
  })
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty({ description: 'Leave start date', example: '2026-07-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Leave end date', example: '2026-07-15' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Leave observation/reason',
    example: 'Voyage familial',
  })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiProperty({
    description: 'Deduct from annual leave balance',
    example: true,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  deductFromAnnualBalance: boolean;
}
