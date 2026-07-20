import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindAllEmployeesDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by Company UUID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by Department UUID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by Position UUID' })
  @IsOptional()
  @IsString()
  positionUuid?: string;

  @ApiPropertyOptional({ description: 'Filter by Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by first name or last name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Include inactive employees (true/false)',
  })
  @IsOptional()
  @IsString()
  includeInactive?: string;

  @ApiPropertyOptional({ description: 'Include sensitive data (true/false)' })
  @IsOptional()
  @IsString()
  includeSensitive?: string;

  @ApiPropertyOptional({
    description: 'Filter by contract type (CDI, CDD, Stage, Prestation, Essai)',
  })
  @IsOptional()
  @IsString()
  contractType?: string;
}
