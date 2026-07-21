import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateLeaveDto {
  @ApiProperty({ description: 'Leave type config UUID' })
  @IsString()
  leaveTypeConfigId: string;

  @ApiProperty({ description: 'Leave start date', example: '2026-07-01' })
  @IsDateString()
  startDate: string;

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
  @ApiProperty({
    description: 'Deduct from annual leave balance',
    example: true,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  deductFromAnnualBalance: boolean;
}
