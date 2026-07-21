-- CreateEnum
CREATE TYPE "CandidacyStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Candidacy" (
    "uuid" TEXT NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "identityCard" VARCHAR(500) NOT NULL,
    "cv" VARCHAR(500) NOT NULL,
    "degree" VARCHAR(500),
    "coverLetter" VARCHAR(500),
    "status" "CandidacyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recruitmentUuid" TEXT NOT NULL,

    CONSTRAINT "Candidacy_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "Candidacy" ADD CONSTRAINT "Candidacy_recruitmentUuid_fkey" FOREIGN KEY ("recruitmentUuid") REFERENCES "Recruitment"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
