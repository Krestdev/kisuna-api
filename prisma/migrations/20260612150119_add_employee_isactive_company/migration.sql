-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
