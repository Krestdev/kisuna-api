import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TerminateContractDto {
  @ApiProperty({ description: 'Reason for terminating the contract' })
  @IsString()
  @IsNotEmpty()
  terminationReason: string;
}
