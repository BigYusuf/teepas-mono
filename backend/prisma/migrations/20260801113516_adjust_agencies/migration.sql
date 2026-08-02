/*
  Warnings:

  - You are about to drop the column `avatar` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `businessRegNumber` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `coverBanner` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `openingHours` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `servicesOffered` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `supportEmail` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `videoIntro` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `agencies` table. All the data in the column will be lost.
  - You are about to drop the column `yearEstablished` on the `agencies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "agencies" DROP COLUMN "avatar",
DROP COLUMN "businessRegNumber",
DROP COLUMN "commissionRate",
DROP COLUMN "coverBanner",
DROP COLUMN "email",
DROP COLUMN "logoUrl",
DROP COLUMN "openingHours",
DROP COLUMN "phone",
DROP COLUMN "servicesOffered",
DROP COLUMN "socialLinks",
DROP COLUMN "supportEmail",
DROP COLUMN "taxId",
DROP COLUMN "videoIntro",
DROP COLUMN "website",
DROP COLUMN "yearEstablished";

-- CreateTable
CREATE TABLE "agencyContact" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "openingHours" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyBusinessDetails" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION,
    "servicesOffered" TEXT[],
    "yearEstablished" INTEGER,
    "businessRegNumber" TEXT,
    "taxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyBusinessDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencyMedia" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "avatar" TEXT,
    "coverBanner" TEXT,
    "logoUrl" TEXT,
    "videoIntro" TEXT,
    "socialLinks" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencyContact_agencyId_key" ON "agencyContact"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "agencyBusinessDetails_agencyId_key" ON "agencyBusinessDetails"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "agencyMedia_agencyId_key" ON "agencyMedia"("agencyId");

-- AddForeignKey
ALTER TABLE "agencyContact" ADD CONSTRAINT "agencyContact_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyBusinessDetails" ADD CONSTRAINT "agencyBusinessDetails_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyMedia" ADD CONSTRAINT "agencyMedia_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
