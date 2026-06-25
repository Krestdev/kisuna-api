/*
  Warnings:

  - You are about to drop the column `employeeUuid` on the `Position` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_employeeUuid_fkey";

-- DropIndex
DROP INDEX "Position_employeeUuid_key";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "position" VARCHAR(100);

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "employeeUuid";
