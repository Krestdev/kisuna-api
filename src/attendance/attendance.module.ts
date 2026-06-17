import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DatabaseModule } from '../database/database.module';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [DatabaseModule, SchedulesModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
