import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
export class AdjustPayrollDto {
  @ApiPropertyOptional({ description: 'Manual bonus amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus: number;

  @ApiPropertyOptional({ description: 'Manual deduction amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions: number;
}
