import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, Matches } from 'class-validator';
import { EmployeeScheduleCreateInput } from 'generated/prisma/models';

export class CreateScheduleDto implements Omit<
  EmployeeScheduleCreateInput,
  'status' | 'uuid' | 'createdAt' | 'updatedAt' | 'employee'
> {
  @ApiProperty({ description: 'Employee UUID' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '08:00', description: 'Shift start in HH:MM format' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'shiftStart must be in HH:MM format',
  })
  shiftStart: string;

  @ApiProperty({ example: '17:00', description: 'Shift end in HH:MM format' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'shiftEnd must be in HH:MM format',
  })
  shiftEnd: string;

  @ApiProperty({
    example: 'MON,TUE,WED,THU,FRI',
    description: 'Comma-separated work days (MON,TUE,WED,THU,FRI,SAT,SUN)',
  })
  @IsNotEmpty()
  @IsString()
  workDays: string;
}
