import { IsString } from 'class-validator';

export class RejectLeaveDto {
  @IsString()
  rejectReason: string;
}
