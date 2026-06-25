/*
  Warnings:

  - The values [USER] on the enum `SystemRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `checkin` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Attendance` table. All the data in the column will be lost.
  - The `checkOut` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `schedule` on the `EmployeeSchedule` table. All the data in the column will be lost.
  - The `document_type` column on the `File` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `payslipId` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Payroll` table. All the data in the column will be lost.
  - The `status` column on the `Payroll` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `filesId` on the `Payslip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payrollId]` on the table `Payslip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checkIn` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseSalary` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `contract_type` on the `Contract` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `shiftEnd` to the `EmployeeSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shiftStart` to the `EmployeeSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmployeeSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workDays` to the `EmployeeSchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseSalary` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netSalary` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workedDays` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payrollId` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Made the column `issueDate` on table `Payslip` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalAmount` on table `Payslip` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyId` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EarningCategory" AS ENUM ('PRIME', 'INDEMNITE', 'AVANTAGE_NATURE');

-- CreateEnum
CREATE TYPE "DeclarationType" AS ENUM ('MONTHLY', 'START_OF_YEAR', 'END_OF_YEAR');

-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CDI', 'CDD', 'Stage', 'Prestation', 'Essai');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'FIELD');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'RESUME', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "SystemRole_new" AS ENUM ('SUPER_ADMIN', 'COMPANY_ADMIN', 'ADMIN', 'EMPLOYEE');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "SystemRole_new" USING ("role"::text::"SystemRole_new");
ALTER TYPE "SystemRole" RENAME TO "SystemRole_old";
ALTER TYPE "SystemRole_new" RENAME TO "SystemRole";
DROP TYPE "public"."SystemRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_payslipId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_filesId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_departmentId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "checkin",
DROP COLUMN "updateAt",
ADD COLUMN     "checkIn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mission" VARCHAR(255),
ADD COLUMN     "observations" VARCHAR(500),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "checkOut",
ADD COLUMN     "checkOut" TIMESTAMP(3),
ALTER COLUMN "workedHour" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "overtimes" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT';

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "baseSalary" INTEGER NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'XAF',
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "expiryAlertSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "terminationReason" TEXT,
DROP COLUMN "contract_type",
ADD COLUMN     "contract_type" "ContractType" NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "countryOfResidence" VARCHAR(100),
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "grade" VARCHAR(100),
ADD COLUMN     "idDocumentExpiryDate" TIMESTAMP(3),
ADD COLUMN     "idDocumentFileUrl" VARCHAR(500),
ADD COLUMN     "idDocumentIssueDate" TIMESTAMP(3),
ADD COLUMN     "idDocumentIssuePlace" VARCHAR(100),
ADD COLUMN     "idDocumentNumber" VARCHAR(100),
ADD COLUMN     "idDocumentType" VARCHAR(50),
ADD COLUMN     "nationality" VARCHAR(100),
ADD COLUMN     "paymentMode" VARCHAR(50),
ADD COLUMN     "supervisorId" TEXT,
ADD COLUMN     "workLocation" VARCHAR(50),
ADD COLUMN     "workLocationDetails" VARCHAR(255);

-- AlterTable
ALTER TABLE "EmployeeSchedule" DROP COLUMN "schedule",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "shiftEnd" VARCHAR(5) NOT NULL,
ADD COLUMN     "shiftStart" VARCHAR(5) NOT NULL,
ADD COLUMN     "status" "ScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workDays" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "expired_date" TIMESTAMP(3),
DROP COLUMN "document_type",
ADD COLUMN     "document_type" "DocumentType" DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "payslipId",
DROP COLUMN "updateAt",
ADD COLUMN     "absentDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "baseSalary" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "netSalary" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "overtimePay" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workedDays" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Payslip" DROP COLUMN "filesId",
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "payrollId" TEXT NOT NULL,
ALTER COLUMN "issueDate" SET NOT NULL,
ALTER COLUMN "issueDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "totalAmount" SET NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "companyId" TEXT NOT NULL,
ALTER COLUMN "departmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';

-- CreateTable
CREATE TABLE "Leave" (
    "uuid" SERIAL NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" VARCHAR(255),
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING_MANAGER',
    "approvedBy" TEXT,
    "rejectReason" VARCHAR(255),
    "justificatifUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "uuid" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "totalDays" INTEGER NOT NULL DEFAULT 21,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "remainingDays" INTEGER NOT NULL DEFAULT 21,
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "EarningItem" (
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" "EarningCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EarningItem_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Declaration" (
    "uuid" TEXT NOT NULL,
    "type" "DeclarationType" NOT NULL DEFAULT 'MONTHLY',
    "status" "DeclarationStatus" NOT NULL DEFAULT 'DRAFT',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "submittedBy" VARCHAR(100),
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Declaration_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "DeclarationLine" (
    "uuid" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "baseSalaryTaxable" BOOLEAN NOT NULL DEFAULT true,
    "baseSalaryCotisable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "declarationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,

    CONSTRAINT "DeclarationLine_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "DeclarationEarning" (
    "uuid" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT false,
    "cotisable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "declarationLineId" TEXT NOT NULL,
    "earningItemId" TEXT NOT NULL,

    CONSTRAINT "DeclarationEarning_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_year_key" ON "LeaveBalance"("employeeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "EarningItem_companyId_name_key" ON "EarningItem"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Declaration_companyId_periodStart_periodEnd_type_key" ON "Declaration"("companyId", "periodStart", "periodEnd", "type");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationLine_declarationId_employeeId_contractId_key" ON "DeclarationLine"("declarationId", "employeeId", "contractId");

-- CreateIndex
CREATE UNIQUE INDEX "DeclarationEarning_declarationLineId_earningItemId_key" ON "DeclarationEarning"("declarationLineId", "earningItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_payrollId_key" ON "Payslip"("payrollId");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningItem" ADD CONSTRAINT "EarningItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Declaration" ADD CONSTRAINT "Declaration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationLine" ADD CONSTRAINT "DeclarationLine_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES "Declaration"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationLine" ADD CONSTRAINT "DeclarationLine_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationLine" ADD CONSTRAINT "DeclarationLine_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationEarning" ADD CONSTRAINT "DeclarationEarning_declarationLineId_fkey" FOREIGN KEY ("declarationLineId") REFERENCES "DeclarationLine"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeclarationEarning" ADD CONSTRAINT "DeclarationEarning_earningItemId_fkey" FOREIGN KEY ("earningItemId") REFERENCES "EarningItem"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
