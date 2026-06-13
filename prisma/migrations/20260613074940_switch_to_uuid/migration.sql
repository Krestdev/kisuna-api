/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Contract` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `phoneNumber` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `EmployeeSchedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Payroll` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Payslip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Position` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PositionPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[employeeUuid]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeUuid]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_payrollUuid_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_employeeUuid_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSchedule" DROP CONSTRAINT "EmployeeSchedule_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_payslipId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_filesId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_employeeUuid_fkey";

-- DropForeignKey
ALTER TABLE "PositionPermission" DROP CONSTRAINT "PositionPermission_permissionUuid_fkey";

-- DropForeignKey
ALTER TABLE "PositionPermission" DROP CONSTRAINT "PositionPermission_positionUuid_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_employeeId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ALTER COLUMN "payrollUuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Attendance_uuid_seq";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Company_uuid_seq";

-- AlterTable
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "companyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Contract_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Contract_uuid_seq";

-- AlterTable
ALTER TABLE "Department" DROP CONSTRAINT "Department_pkey",
ALTER COLUMN "companyId" SET DATA TYPE TEXT,
ALTER COLUMN "employeeUuid" SET DATA TYPE TEXT,
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Department_uuid_seq";

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "phoneNumber" SET DATA TYPE INTEGER,
ALTER COLUMN "companyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Employee_uuid_seq";

-- AlterTable
ALTER TABLE "EmployeeSchedule" DROP CONSTRAINT "EmployeeSchedule_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EmployeeSchedule_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "EmployeeSchedule_uuid_seq";

-- AlterTable
ALTER TABLE "File" DROP CONSTRAINT "File_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "File_uuid_seq";

-- AlterTable
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "contractId" SET DATA TYPE TEXT,
ALTER COLUMN "payslipId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payroll_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Payroll_uuid_seq";

-- AlterTable
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ALTER COLUMN "filesId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payslip_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Payslip_uuid_seq";

-- AlterTable
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Permission_uuid_seq";

-- AlterTable
ALTER TABLE "Position" DROP CONSTRAINT "Position_pkey",
ALTER COLUMN "departmentId" SET DATA TYPE TEXT,
ALTER COLUMN "employeeUuid" SET DATA TYPE TEXT,
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "Position_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "Position_uuid_seq";

-- AlterTable
ALTER TABLE "PositionPermission" DROP CONSTRAINT "PositionPermission_pkey",
ALTER COLUMN "positionUuid" SET DATA TYPE TEXT,
ALTER COLUMN "permissionUuid" SET DATA TYPE TEXT,
ADD CONSTRAINT "PositionPermission_pkey" PRIMARY KEY ("positionUuid", "permissionUuid");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "uuid" DROP DEFAULT,
ALTER COLUMN "uuid" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("uuid");
DROP SEQUENCE "User_uuid_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Department_employeeUuid_key" ON "Department"("employeeUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Position_employeeUuid_key" ON "Position"("employeeUuid");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_employeeUuid_fkey" FOREIGN KEY ("employeeUuid") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_employeeUuid_fkey" FOREIGN KEY ("employeeUuid") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionPermission" ADD CONSTRAINT "PositionPermission_positionUuid_fkey" FOREIGN KEY ("positionUuid") REFERENCES "Position"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionPermission" ADD CONSTRAINT "PositionPermission_permissionUuid_fkey" FOREIGN KEY ("permissionUuid") REFERENCES "Permission"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_payrollUuid_fkey" FOREIGN KEY ("payrollUuid") REFERENCES "Payroll"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_filesId_fkey" FOREIGN KEY ("filesId") REFERENCES "File"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
