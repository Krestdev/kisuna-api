import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { CandidacyController } from './candidates/candidacy.controller';
import { CandidacyService } from './candidates/candidacy.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RecruitmentController, CandidacyController],
  providers: [RecruitmentService, CandidacyService],
})
export class RecruitmentModule {}
