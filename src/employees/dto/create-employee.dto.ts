import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Gender, ContractType } from '@prisma/client';
import { Type, Transform } from 'class-transformer';

class ContractInfoDto {
  @ApiProperty({ example: '2024-01-01', description: 'Contract start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-12-31', description: 'Contract end date' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    enum: ContractType,
    example: 'CDD',
    description: 'Contract type',
  })
  @IsEnum(ContractType)
  @IsNotEmpty()
  contract_type: ContractType;

  @ApiProperty({ example: 500000, description: 'Base salary amount' })
  @IsNumber()
  @IsNotEmpty()
  baseSalary: number;

  @ApiProperty({ example: 'XAF', description: 'Currency', default: 'XAF' })
  @IsString()
  currency: string;
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

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Employee gender',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Employee email address',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    example: '123 Main St, Springfield',
    description: 'Employee address',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    example: 1234567890,
    description: 'Employee phone number',
  })
  @IsOptional()
  @Type(() => Number)
  phoneNumber?: number;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Employee birthday (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: 'Camerounaise', description: 'Nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    example: 'Cameroun',
    description: 'Country of residence',
  })
  @IsOptional()
  @IsString()
  countryOfResidence?: string;

  @ApiPropertyOptional({ example: 1, description: 'Matrimonial status code' })
  @IsOptional()
  @Type(() => Number)
  matrimonial_status?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of children' })
  @IsOptional()
  @Type(() => Number)
  number_of_children?: number;

  @ApiPropertyOptional({ example: 987654321, description: 'CNPS Number' })
  @IsOptional()
  @Type(() => Number)
  CNPSNumber?: number;

  @ApiPropertyOptional({
    example: 'Jane Doe',
    description: 'Emergency contact name',
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    example: 9876543210,
    description: 'Emergency contact phone',
  })
  @IsOptional()
  @Type(() => Number)
  EmergencyContactPhone?: number;

  @ApiPropertyOptional({ example: 'CNI', description: 'ID document type' })
  @IsOptional()
  @IsString()
  idDocumentType?: string;

  @ApiPropertyOptional({
    example: '123456789',
    description: 'ID document number',
  })
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

  @ApiPropertyOptional({ description: 'ID document file URL' })
  @IsOptional()
  @IsString()
  idDocumentFileUrl?: string;

  @ApiPropertyOptional({ example: 'Cadre', description: 'Employee category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Grade 5', description: 'Employee grade' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    example: 'Virement bancaire',
    description: 'Payment mode',
  })
  @IsOptional()
  @IsString()
  paymentMode?: string;

  @ApiPropertyOptional({ example: 'Onsite', description: 'Work location' })
  @IsOptional()
  @IsString()
  workLocation?: string;

  @ApiPropertyOptional({
    example: 'Bastos Office',
    description: 'Work location details',
  })
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
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined')
        return undefined;
    }
    return value;
  })
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({
    example: 'Software Engineer',
    description: 'Job position title',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'Contract information (optional)' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '' || value === 'null' || value === 'undefined')
      return undefined;
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => ContractInfoDto)
  contract?: ContractInfoDto;

  @ApiPropertyOptional({ description: 'Contract information alias (optional)' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === '' || value === 'null' || value === 'undefined')
      return undefined;
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @ValidateNested()
  @Type(() => ContractInfoDto)
  contracts?: ContractInfoDto;

  @ApiPropertyOptional({ description: 'Department UUID' })
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined')
        return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Supervisor UUID' })
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined')
        return undefined;
    }
    return value;
  })
  @IsOptional()
  @IsString()
  supervisorId?: string;

  @ApiPropertyOptional({
    example: '2023-12-31',
    description: 'End date / Termination date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 21,
    description: 'Number of leave days available',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  leaveDays?: number;
}
