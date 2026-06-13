import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePositionDto {
  @ApiProperty({ example: 'Senior Developer', description: 'Position title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Leads a team of engineers', description: 'Position description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  description?: string;

  @ApiProperty({ example: 3, description: 'Position level', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  level?: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Department UUID' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Employee UUID', required: false })
  @IsOptional()
  @IsUUID()
  employeeUuid?: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174002'], description: 'Permission UUIDs', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionUuids?: string[];
}
