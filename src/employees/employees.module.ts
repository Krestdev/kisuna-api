import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DatabaseModule } from '../database/database.module';
import { ContractsModule } from '../contracts/contracts.module';
import { LeavesModule } from '../leaves/leaves.module';
import { AuthModule } from '../auth/auth.module';
import { RustfsModule } from '../rustfs/rustfs.module';

@Module({
  imports: [DatabaseModule, ContractsModule, LeavesModule, AuthModule, RustfsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
