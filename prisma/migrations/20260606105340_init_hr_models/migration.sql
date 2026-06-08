-- CreateTable
CREATE TABLE "Employee" (
    "uuid" TEXT NOT NULL,
    "address" TEXT,
    "phoneNumber" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" VARCHAR(50),
    "maritalStatus" VARCHAR(50),
    "nationality" VARCHAR(50),
    "NumberOfChildren" INTEGER,
    "CNPSNumber" VARCHAR(50),
    "identityDocument" VARCHAR(50),
    "identityDocumentDelivaryDate" TIMESTAMP(3),
    "identityDocumentExpiryDate" TIMESTAMP(3),
    "identityDocumentDeliveryLocation" TEXT,
    "identityDocumentPath" TEXT,
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "contractPath" TEXT,
    "hireDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(50),
    "employmentType" VARCHAR(50),
    "baseSalary" DECIMAL(12,2),
    "bonusAmount" DECIMAL(12,2),
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "departmentId" TEXT,
    "positionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Department" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Position" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
