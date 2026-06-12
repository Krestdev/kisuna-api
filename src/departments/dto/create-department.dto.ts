import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Human Resources', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Manages HR policies and recruitment', description: 'Department description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: 1, description: 'Company ID' })
  @IsInt()
  @Type(() => Number)
  companyId: number;

  @ApiProperty({ example: 5, description: 'Manager employee ID', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeUuid?: number;
}
