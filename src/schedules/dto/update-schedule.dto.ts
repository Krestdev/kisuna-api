import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ScheduleStatus } from '../../../generated/prisma/client';

export class UpdateScheduleDto extends PartialType(
  OmitType(CreateScheduleDto, ['employeeId'] as const),
) {
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
