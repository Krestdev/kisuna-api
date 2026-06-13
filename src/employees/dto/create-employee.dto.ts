import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum, IsDateString, IsUUID } from 'class-validator';
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

  @ApiProperty({ enum: Gender, example: Gender.MALE, description: 'Employee gender' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '123 Main St, Springfield', description: 'Employee address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({ example: 1234567890, description: 'Employee phone number', required: false })
  @IsOptional()
  phoneNumber?: number;

  @ApiProperty({ example: '1990-01-01', description: 'Employee birthday (ISO date string)', required: false })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({ example: 1, description: 'Matrimonial status code (e.g., 1 for Single, 2 for Married)', required: false })
  @IsOptional()
  matrimonial_status?: number;

  @ApiProperty({ example: 0, description: 'Number of children', required: false })
  @IsOptional()
  number_of_children?: number;

  @ApiProperty({ example: 987654321, description: 'CNPS (Social Security) Number', required: false })
  @IsOptional()
  CNPSNumber?: number;

  @ApiProperty({ example: 'Jane Doe', description: 'Emergency contact name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiProperty({ example: 9876543210, description: 'Emergency contact phone number', required: false })
  @IsOptional()
  EmergencyContactPhone?: number;

  @ApiProperty({ example: '2023-01-15', description: 'Hire date (ISO date string)', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Employee status', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  status?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Company UUID', required: false })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Position UUID to assign upon creation', required: false })
  @IsOptional()
  @IsUUID()
  positionUuid?: string;
}
