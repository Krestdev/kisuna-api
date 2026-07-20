import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { CompaniesModule } from './companies/companies.module';
import { ContractsModule } from './contracts/contracts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RustfsModule } from './rustfs/rustfs.module';
import { FilesModule } from './files/files.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollsModule } from './payrolls/payrolls.module';
import { PayslipsModule } from './payslips/payslips.module';
import { SchedulesModule } from './schedules/schedules.module';
import { LeavesModule } from './leaves/leaves.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MeModule } from './me/me.module';
import { DeclarationsModule } from './declarations/declarations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    DepartmentsModule,
    EmployeesModule,
    CompaniesModule,
    ContractsModule,
    RustfsModule,
    FilesModule,
    AttendanceModule,
    PayrollsModule,
    PayslipsModule,
    SchedulesModule,
    LeavesModule,
    DashboardModule,
    MeModule,
    DeclarationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
