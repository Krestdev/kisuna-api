import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Candidacy, CandidacyStatus } from 'generated/prisma/client';

export class FindAllCandidatesDto implements Pick<
  Candidacy,
  'status' | 'fullName' | 'phone' | 'email' | 'address'
> {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsEnum(CandidacyStatus)
  @IsOptional()
  @IsNotEmpty()
  status: CandidacyStatus;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address: string;
}
