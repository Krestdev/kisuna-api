import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateCandidacyDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() recruitmentUuid: string;
}
