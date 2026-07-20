import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ContractType } from '@prisma/client';
import { ContractCreateInput } from 'generated/prisma/models';

export class CreateContractDto implements Omit<
  ContractCreateInput,
  'uuid' | 'createdAt' | 'updatedAt' | 'employeeId' | 'employee' | 'company'
> {
  @ApiProperty({ description: 'Start date of the contract' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the contract' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: ContractType, description: 'Type of contract' })
  @IsEnum(ContractType)
  @IsNotEmpty()
  contract_type: ContractType;

  @ApiProperty({ description: 'Base salary in integer format' })
  @IsInt()
  @IsNotEmpty()
  baseSalary: number;

  @ApiPropertyOptional({
    description: 'Currency code, default is XAF',
    default: 'XAF',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Company UUID' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;
}
