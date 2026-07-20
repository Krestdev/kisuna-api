import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EarningCategory } from '@prisma/client';

export class CreateEarningItemDto {
  @ApiProperty({
    example: 'Housing Allowance',
    description: 'Name of the earning item',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: EarningCategory,
    example: 'ALLOWANCE',
    description: 'Category of earning',
  })
  @IsEnum(EarningCategory)
  category: EarningCategory;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Company UUID',
  })
  @IsUUID()
  companyId: string;
}

export class UpdateEarningItemDto {
  @ApiProperty({ example: 'Transport Allowance', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: EarningCategory, example: 'ALLOWANCE', required: false })
  @IsEnum(EarningCategory)
  @IsOptional()
  category?: EarningCategory;

  @ApiProperty({ example: true, required: false, description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
