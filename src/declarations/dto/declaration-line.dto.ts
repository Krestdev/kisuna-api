import {
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DeclarationEarningCreateInput } from 'generated/prisma/models';

export class DeclarationEarningItemDto implements Omit<
  DeclarationEarningCreateInput,
  'id' | 'declarationId' | 'declarationLine' | 'earningItem'
> {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Earning item UUID',
  })
  @IsUUID()
  earningItemId: string;

  @ApiProperty({ example: 50000, description: 'Amount in currency units' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: true, description: 'Is this earning taxable?' })
  @IsBoolean()
  taxable: boolean;

  @ApiProperty({
    example: true,
    description: 'Is this earning subject to social contributions?',
  })
  @ApiProperty({
    example: true,
    description: 'Is this earning subject to social contributions?',
  })
  @IsBoolean()
  cotisable: boolean;
}

export class CreateDeclarationLineDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Employee UUID',
  })
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Employee UUID',
  })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Contract UUID (optional, will use active contract if not provided)',
    required: false,
  })
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Contract UUID (optional, will use active contract if not provided)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiProperty({ example: 500000, description: 'Base salary amount' })
  @IsNumber()
  baseSalary: number;

  @ApiProperty({ example: true, description: 'Is base salary taxable?' })
  @IsBoolean()
  baseSalaryTaxable: boolean;

  @ApiProperty({
    example: true,
    description: 'Is base salary subject to social contributions?',
  })
  @ApiProperty({
    example: true,
    description: 'Is base salary subject to social contributions?',
  })
  @IsBoolean()
  baseSalaryCotisable: boolean;

  @ApiProperty({
    type: [DeclarationEarningItemDto],
    example: [
      {
        earningItemId: '123e4567-e89b-12d3-a456-426614174003',
        amount: 50000,
        taxable: true,
        cotisable: false,
      },
      {
        earningItemId: '123e4567-e89b-12d3-a456-426614174003',
        amount: 50000,
        taxable: true,
        cotisable: false,
      },
    ],
    description: 'Additional earnings for this employee',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeclarationEarningItemDto)
  earnings: DeclarationEarningItemDto[];
}

export class BulkCreateDeclarationLinesDto {
  @ApiProperty({
    type: [CreateDeclarationLineDto],
    description: 'Array of declaration lines to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeclarationLineDto)
  lines: CreateDeclarationLineDto[];
}
