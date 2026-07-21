import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { LeaveCronService } from './leave-cron.service';
import { DatabaseModule } from '../database/database.module';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [DatabaseModule, SchedulesModule],
  controllers: [LeavesController],
  providers: [LeavesService, LeaveCronService],
  exports: [LeavesService],
})
export class LeavesModule {}
