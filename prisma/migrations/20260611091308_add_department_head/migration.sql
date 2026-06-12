/*
  Warnings:

  - A unique constraint covering the columns `[headId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "headId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Department_headId_key" ON "Department"("headId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Employee"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
