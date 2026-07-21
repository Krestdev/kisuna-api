/*
  Warnings:

  - The `status` column on the `Recruitment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "Recruitment" ALTER COLUMN "description" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "RecruitmentStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "place" DROP NOT NULL,
ALTER COLUMN "deadline" DROP NOT NULL;
