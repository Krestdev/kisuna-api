import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum, IsDateString, IsUUID, IsInt, ValidateNested, IsNumber } from 'class-validator';
import { Gender, ContractType } from '@prisma/client';
import { Type } from 'class-transformer';

class ContractInfoDto {
  @ApiProperty({ example: '2024-01-01', description: 'Contract start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-12-31', description: 'Contract end date' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ enum: ContractType, example: 'CDD', description: 'Contract type' })
  @IsEnum(ContractType)
  @IsNotEmpty()
  contract_type: ContractType;

  @ApiProperty({ example: 500000, description: 'Base salary amount' })
  @IsNumber()
  @IsNotEmpty()
  baseSalary: number;

  @ApiPropertyOptional({ example: 'XAF', description: 'Currency', default: 'XAF' })
  @IsOptional()
  @IsString()
  currency?: string;
}

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

  @ApiProperty({ example: 'john.doe@company.com', description: 'Employee email address' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '123 Main St, Springfield', description: 'Employee address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 1234567890, description: 'Employee phone number' })
  @IsOptional()
  phoneNumber?: number;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Employee birthday (ISO date string)' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: 'Camerounaise', description: 'Nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'Cameroun', description: 'Country of residence' })
  @IsOptional()
  @IsString()
  countryOfResidence?: string;

  @ApiPropertyOptional({ example: 1, description: 'Matrimonial status code' })
  @IsOptional()
  matrimonial_status?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of children' })
  @IsOptional()
  number_of_children?: number;

  @ApiPropertyOptional({ example: 987654321, description: 'CNPS Number' })
  @IsOptional()
  CNPSNumber?: number;

  @ApiPropertyOptional({ example: 'Jane Doe', description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: 9876543210, description: 'Emergency contact phone' })
  @IsOptional()
  EmergencyContactPhone?: number;

  @ApiPropertyOptional({ example: 'CNI', description: 'ID document type' })
  @IsOptional()
  @IsString()
  idDocumentType?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'ID document number' })
  @IsOptional()
  @IsString()
  idDocumentNumber?: string;

  @ApiPropertyOptional({ example: '2020-01-01', description: 'ID issue date' })
  @IsOptional()
  @IsDateString()
  idDocumentIssueDate?: string;

  @ApiPropertyOptional({ example: '2030-01-01', description: 'ID expiry date' })
  @IsOptional()
  @IsDateString()
  idDocumentExpiryDate?: string;

  @ApiPropertyOptional({ example: 'Yaoundé', description: 'ID issue place' })
  @IsOptional()
  @IsString()
  idDocumentIssuePlace?: string;

  @ApiPropertyOptional({ example: 'Cadre', description: 'Employee category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Grade 5', description: 'Employee grade' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ example: 'Virement bancaire', description: 'Payment mode' })
  @IsOptional()
  @IsString()
  paymentMode?: string;

  @ApiPropertyOptional({ example: 'Onsite', description: 'Work location' })
  @IsOptional()
  @IsString()
  workLocation?: string;

  @ApiPropertyOptional({ example: 'Bastos Office', description: 'Work location details' })
  @IsOptional()
  @IsString()
  workLocationDetails?: string;

  @ApiPropertyOptional({ example: '2023-01-15', description: 'Hire date' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Employee status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Company UUID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Position UUID' })
  @IsOptional()
  @IsUUID()
  positionUuid?: string;

  @ApiPropertyOptional({ description: 'Contract information (optional)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractInfoDto)
  contract?: ContractInfoDto;
}
