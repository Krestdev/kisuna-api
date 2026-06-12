/*
  Warnings:

  - You are about to drop the column `manager` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `baseSalary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `bonusAmount` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_date` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_location` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_path` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `expired_date` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceId` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `baseSalary` on the `Payslip` table. All the data in the column will be lost.
  - Changed the type of `updatedAt` on the `Contract` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gender` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Payroll" DROP CONSTRAINT "Payroll_attendanceId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "payrollUuid" INTEGER;

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "updatedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "manager";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "baseSalary",
DROP COLUMN "bonusAmount",
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "delivery_date",
DROP COLUMN "delivery_location",
DROP COLUMN "delivery_path",
DROP COLUMN "expired_date",
ADD COLUMN     "path" VARCHAR(255);

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "attendanceId";

-- AlterTable
ALTER TABLE "Payslip" DROP COLUMN "baseSalary",
ADD COLUMN     "totalAmount" INTEGER;

-- CreateTable
CREATE TABLE "Permission" (
    "uuid" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "PositionPermission" (
    "positionUuid" INTEGER NOT NULL,
    "permissionUuid" INTEGER NOT NULL,

    CONSTRAINT "PositionPermission_pkey" PRIMARY KEY ("positionUuid","permissionUuid")
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "refreshToken" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "PositionPermission" ADD CONSTRAINT "PositionPermission_positionUuid_fkey" FOREIGN KEY ("positionUuid") REFERENCES "Position"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionPermission" ADD CONSTRAINT "PositionPermission_permissionUuid_fkey" FOREIGN KEY ("permissionUuid") REFERENCES "Permission"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_payrollUuid_fkey" FOREIGN KEY ("payrollUuid") REFERENCES "Payroll"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
