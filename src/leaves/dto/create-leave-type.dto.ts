import { IsString, IsNotEmpty, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString() @IsNotEmpty() label: string;
  @IsInt() @IsPositive() daysAllowed: number;
  @IsString() @IsNotEmpty() companyId: string;
}
