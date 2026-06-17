import { Module } from '@nestjs/common';
import { PayrollsService } from './payrolls.service';
import { PayrollsController } from './payrolls.controller';
import { DatabaseModule } from '../database/database.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [DatabaseModule, AttendanceModule, SchedulesModule],
  controllers: [PayrollsController],
  providers: [PayrollsService],
  exports: [PayrollsService],
})
export class PayrollsModule {}
