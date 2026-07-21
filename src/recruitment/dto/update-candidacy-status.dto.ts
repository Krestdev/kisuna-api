import { IsEnum } from 'class-validator';
import { CandidacyStatus } from '../../../generated/prisma/client';

export class UpdateCandidacyStatusDto {
  @IsEnum(CandidacyStatus) status: CandidacyStatus;
}
