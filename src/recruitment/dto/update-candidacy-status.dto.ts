import { IsEnum } from 'class-validator';
import { CandidacyStatus } from '@prisma/client';

export class UpdateCandidacyStatusDto {
  @IsEnum(CandidacyStatus) status: CandidacyStatus;
}
