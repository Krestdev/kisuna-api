/*
  Warnings:

  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PositionPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "PositionPermission" DROP CONSTRAINT "PositionPermission_permissionUuid_fkey";

-- DropForeignKey
ALTER TABLE "PositionPermission" DROP CONSTRAINT "PositionPermission_positionUuid_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Position";

-- DropTable
DROP TABLE "PositionPermission";
