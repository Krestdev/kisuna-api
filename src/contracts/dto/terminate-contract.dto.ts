import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ContractUpdateInput } from 'generated/prisma/models';

export class TerminateContractDto implements Omit<
  ContractUpdateInput,
  | 'uuid'
  | 'createdAt'
  | 'updatedAt'
  | 'employeeId'
  | 'employee'
  | 'company'
  | 'startDate'
  | 'endDate'
  | 'probationPeriod'
  | 'jobTitle'
  | 'workLocation'
  | 'salary'
  | 'hoursPerWeek'
> {
  @ApiProperty({ description: 'Reason for terminating the contract' })
  @IsString()
  @IsNotEmpty()
  terminationReason: string;
}
