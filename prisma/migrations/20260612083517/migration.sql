/*
  Warnings:

  - The primary key for the `Department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `headId` on the `Department` table. All the data in the column will be lost.
  - The `uuid` column on the `Department` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `name` on the `Department` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `NumberOfChildren` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `contractEndDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `contractPath` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `contractStartDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContactPhone` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employmentType` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `identityDocument` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `identityDocumentDelivaryDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `identityDocumentDeliveryLocation` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `identityDocumentExpiryDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `identityDocumentPath` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `maritalStatus` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Employee` table. All the data in the column will be lost.
  - The `uuid` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `address` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `phoneNumber` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `CNPSNumber` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `status` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(10)`.
  - You are about to alter the column `baseSalary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `bonusAmount` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.
  - You are about to alter the column `emergencyContactName` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `Position` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Position` table. All the data in the column will be lost.
  - The `uuid` column on the `Position` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `description` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_headId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_positionId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_userId_fkey";

-- DropIndex
DROP INDEX "Department_headId_key";

-- AlterTable
ALTER TABLE "Department" DROP CONSTRAINT "Department_pkey",
DROP COLUMN "headId",
ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "employeeUuid" INTEGER,
ADD COLUMN     "manager" VARCHAR(100),
DROP COLUMN "uuid",
ADD COLUMN     "uuid" SERIAL NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "NumberOfChildren",
DROP COLUMN "contractEndDate",
DROP COLUMN "contractPath",
DROP COLUMN "contractStartDate",
DROP COLUMN "departmentId",
DROP COLUMN "emergencyContactPhone",
DROP COLUMN "employmentType",
DROP COLUMN "identityDocument",
DROP COLUMN "identityDocumentDelivaryDate",
DROP COLUMN "identityDocumentDeliveryLocation",
DROP COLUMN "identityDocumentExpiryDate",
DROP COLUMN "identityDocumentPath",
DROP COLUMN "isActive",
DROP COLUMN "maritalStatus",
DROP COLUMN "nationality",
DROP COLUMN "positionId",
DROP COLUMN "userId",
ADD COLUMN     "EmergencyContactPhone" INTEGER,
ADD COLUMN     "firstName" VARCHAR(100) NOT NULL,
ADD COLUMN     "lastName" VARCHAR(100) NOT NULL,
ADD COLUMN     "matrimonial_status" INTEGER,
ADD COLUMN     "number_of_children" INTEGER,
DROP COLUMN "uuid",
ADD COLUMN     "uuid" SERIAL NOT NULL,
ALTER COLUMN "address" SET DATA TYPE VARCHAR(255),
DROP COLUMN "phoneNumber",
ADD COLUMN     "phoneNumber" INTEGER,
DROP COLUMN "gender",
ADD COLUMN     "gender" BOOLEAN NOT NULL,
DROP COLUMN "CNPSNumber",
ADD COLUMN     "CNPSNumber" INTEGER,
ALTER COLUMN "status" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "baseSalary" SET DATA TYPE INTEGER,
ALTER COLUMN "bonusAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "emergencyContactName" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "Position" DROP CONSTRAINT "Position_pkey",
DROP COLUMN "name",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD COLUMN     "employeeUuid" INTEGER,
ADD COLUMN     "level" INTEGER,
ADD COLUMN     "title" VARCHAR(100) NOT NULL,
DROP COLUMN "uuid",
ADD COLUMN     "uuid" SERIAL NOT NULL,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "Position_pkey" PRIMARY KEY ("uuid");

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Company" (
    "uuid" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Contract" (
    "uuid" SERIAL NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "contract_type" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "uuid" SERIAL NOT NULL,
    "checkin" VARCHAR(10),
    "checkOut" VARCHAR(10),
    "workedHour" INTEGER,
    "overtimes" INTEGER,
    "status" VARCHAR(10),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "File" (
    "uuid" SERIAL NOT NULL,
    "file_name" VARCHAR(100) NOT NULL,
    "document_type" VARCHAR(10),
    "delivery_date" TIMESTAMP(3),
    "expired_date" TIMESTAMP(3),
    "delivery_location" VARCHAR(100),
    "delivery_path" VARCHAR(255),
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "EmployeeSchedule" (
    "uuid" SERIAL NOT NULL,
    "schedule" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeSchedule_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "uuid" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" INTEGER NOT NULL,
    "contractId" INTEGER NOT NULL,
    "payslipId" INTEGER,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "uuid" SERIAL NOT NULL,
    "baseSalary" INTEGER,
    "issueDate" TIMESTAMP(3),
    "employeeId" INTEGER NOT NULL,
    "filesId" INTEGER,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_employeeUuid_fkey" FOREIGN KEY ("employeeUuid") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_employeeUuid_fkey" FOREIGN KEY ("employeeUuid") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_filesId_fkey" FOREIGN KEY ("filesId") REFERENCES "File"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
