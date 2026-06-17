import { Module } from '@nestjs/common';
import { PayslipsService } from './payslips.service';
import { PayslipsController } from './payslips.controller';
import { DatabaseModule } from '../database/database.module';
import { RustfsModule } from '../rustfs/rustfs.module';

@Module({
  imports: [DatabaseModule, RustfsModule],
  controllers: [PayslipsController],
  providers: [PayslipsService],
})
export class PayslipsModule {}
