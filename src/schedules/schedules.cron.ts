import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulesService } from './schedules.service';

@Injectable()
export class SchedulesCron {
  private readonly logger = new Logger(SchedulesCron.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  // Runs every day at midnight
  @Cron('0 0 * * *')
  async expireSchedules() {
    this.logger.log('Running schedule expiration job...');
    const count = await this.schedulesService.expireOutdatedSchedules();
    this.logger.log(`Expired ${count} schedule(s).`);
  }
}
