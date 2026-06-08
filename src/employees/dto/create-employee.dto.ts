import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'The user ID this employee profile belongs to' })
  @IsNumber()
  userId!: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phoneNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() birthday?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsString() gender?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() maritalStatus?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nationality?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() NumberOfChildren?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() CNPSNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() identityDocument?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() identityDocumentDelivaryDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() identityDocumentExpiryDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsString() identityDocumentDeliveryLocation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() identityDocumentPath?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() contractStartDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() contractEndDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contractPath?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() hireDate?: Date;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() employmentType?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() baseSalary?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() bonusAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() emergencyContactName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() emergencyContactPhone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() departmentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() positionId?: string;
}
