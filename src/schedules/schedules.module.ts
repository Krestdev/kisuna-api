import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesCron } from './schedules.cron';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, SchedulesCron],
  exports: [SchedulesService],
})
export class SchedulesModule {}
