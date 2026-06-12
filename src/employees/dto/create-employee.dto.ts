import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John', description: 'Employee first name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Employee last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'MALE', enum: Gender, description: 'Employee gender' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '123 Main St, City', description: 'Home address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({ example: 237612345678, description: 'Phone number', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  phoneNumber?: number;

  @ApiProperty({ example: '1990-05-15', description: 'Date of birth (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({ example: 1, description: 'Matrimonial status (1=Single, 2=Married)', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  matrimonial_status?: number;

  @ApiProperty({ example: 2, description: 'Number of children', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  number_of_children?: number;

  @ApiProperty({ example: 123456789, description: 'CNPS (Social Security) number', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  CNPSNumber?: number;

  @ApiProperty({ example: 'Jane Doe', description: 'Emergency contact name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiProperty({ example: 237698765432, description: 'Emergency contact phone', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  EmergencyContactPhone?: number;

  @ApiProperty({ example: '2024-01-15', description: 'Hire date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Employment status', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  status?: string;

  @ApiProperty({ example: 1, description: 'Company ID', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({ example: 3, description: 'Position ID', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  positionUuid?: number;
}
