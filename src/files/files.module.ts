import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { DatabaseModule } from '../database/database.module';
import { RustfsModule } from '../rustfs/rustfs.module';

@Module({
  imports: [DatabaseModule, RustfsModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
