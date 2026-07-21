import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { DepartmentCreateInput } from 'generated/prisma/models';

export class CreateDepartmentDto implements Omit<
  DepartmentCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'company'
> {
  @ApiProperty({ example: 'Engineering', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Software development and IT',
    description: 'Department description',
    required: false,
  })
  @ApiProperty({
    example: 'Software development and IT',
    description: 'Department description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Company UUID',
  })
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Company UUID',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Manager (Employee) UUID',
    required: false,
  })
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Manager (Employee) UUID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  employeeUuid?: string;
}
