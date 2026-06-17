import { IsInt, Min } from 'class-validator';

export class UpdateBalanceQuotaDto {
  @IsInt()
  @Min(0)
  totalDays: number;
}
