/*
  Warnings:

  - You are about to drop the column `type` on the `Leave` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "type",
ADD COLUMN     "leaveTypeConfigId" TEXT;

-- DropEnum
DROP TYPE "LeaveType";

-- CreateTable
CREATE TABLE "LeaveTypeConfig" (
    "uuid" TEXT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "daysAllowed" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "LeaveTypeConfig_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveTypeConfig_companyId_label_key" ON "LeaveTypeConfig"("companyId", "label");

-- AddForeignKey
ALTER TABLE "LeaveTypeConfig" ADD CONSTRAINT "LeaveTypeConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_leaveTypeConfigId_fkey" FOREIGN KEY ("leaveTypeConfigId") REFERENCES "LeaveTypeConfig"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
