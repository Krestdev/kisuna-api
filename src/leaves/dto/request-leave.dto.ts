import {
  IsDateString,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class RequestLeaveDto {
  @IsString() @IsNotEmpty() leaveTypeConfigId: string;
  @IsDateString() startDate: string;
  @IsString() @IsOptional() reason?: string;
}
