import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { LeaveCronService } from './leave-cron.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LeavesController],
  providers: [LeavesService, LeaveCronService],
  exports: [LeavesService],
})
export class LeavesModule {}
