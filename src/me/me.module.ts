import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { DatabaseModule } from '../database/database.module';
import { RustfsModule } from '../rustfs/rustfs.module';

@Module({
  imports: [DatabaseModule, RustfsModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
