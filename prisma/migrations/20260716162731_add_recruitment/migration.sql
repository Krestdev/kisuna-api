-- CreateTable
CREATE TABLE "Recruitment" (
    "uuid" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "status" VARCHAR(50) NOT NULL,
    "criteria" TEXT[],
    "imageUrl" VARCHAR(500) NOT NULL,
    "place" VARCHAR(255) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Recruitment_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "Recruitment" ADD CONSTRAINT "Recruitment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
