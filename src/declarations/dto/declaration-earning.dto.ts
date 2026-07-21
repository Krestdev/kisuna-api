import { IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  DeclarationEarningCreateInput,
  DeclarationEarningUpdateInput,
} from 'generated/prisma/models';

export class CreateDeclarationEarningDto implements Omit<
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

export class UpdateDeclarationEarningDto implements Omit<
  DeclarationEarningUpdateInput,
  'id' | 'declarationId'
> {
  @ApiProperty({ example: 75000, description: 'Updated amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: true, description: 'Is this earning taxable?' })
  @IsBoolean()
  taxable: boolean;

  @ApiProperty({
    example: false,
    description: 'Is this earning subject to social contributions?',
  })
  @ApiProperty({
    example: false,
    description: 'Is this earning subject to social contributions?',
  })
  @IsBoolean()
  cotisable: boolean;
}
