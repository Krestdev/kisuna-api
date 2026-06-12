import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePositionDto {
  @ApiProperty({ example: 'Senior Software Engineer', description: 'Position title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Lead development team and design architecture', description: 'Position description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  description?: string;

  @ApiProperty({ example: 3, description: 'Position level (1=Junior, 2=Mid, 3=Senior)', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  level?: number;

  @ApiProperty({ example: 1, description: 'Department ID' })
  @IsInt()
  @Type(() => Number)
  departmentId: number;

  @ApiProperty({ example: 10, description: 'Employee ID assigned to this position', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeUuid?: number;

  @ApiProperty({ example: [1, 2, 5], description: 'Array of permission IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  permissionUuids?: number[];
}
