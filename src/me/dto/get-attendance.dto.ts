import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAttendanceDto {
  @ApiPropertyOptional({
    description: 'Comma-separated attendance statuses',
    example: 'PRESENT,LATE,FIELD',
  })
  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  @IsString({ each: true })
  statuses?: string[];

  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2025-11-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2025-11-30',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
