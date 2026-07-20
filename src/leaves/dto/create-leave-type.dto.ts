import { IsString, IsNotEmpty, IsInt, IsPositive } from 'class-validator';
import { LeaveTypeConfigCreateInput } from 'generated/prisma/models';

export class CreateLeaveTypeDto implements Omit<
  LeaveTypeConfigCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'company'
> {
  @IsString()
  @IsNotEmpty()
  label: string;
  @IsInt()
  @IsPositive()
  daysAllowed: number;
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
