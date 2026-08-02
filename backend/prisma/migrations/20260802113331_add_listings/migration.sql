/*
  Warnings:

  - You are about to drop the column `propertyId` on the `PropertyImages` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `PropertyVideo` table. All the data in the column will be lost.
  - You are about to drop the column `openingHours` on the `agencyContact` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `floorPlan` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `availableFrom` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `buildingMaterial` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `ceilingType` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `construction` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `cooling` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `customFeatures` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `customSpecifications` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `designType` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `economicClass` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `electricBilling` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `electricity` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `favorites` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `floorType` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `furnishing` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `heating` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `landSizeSqm` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `progressStep` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `ratings` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `roofType` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `sizeSqm` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `structureId` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `wallFinish` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `waterSupply` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `yearBuilt` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `propertyAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `propertyApplications` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `propertyBoosts` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `propertyId` on the `propertyTransactions` table. All the data in the column will be lost.
  - You are about to drop the `propertyAmenities` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[listingId]` on the table `propertyAnalytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[listingId]` on the table `propertyPricing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unitId` to the `PropertyImages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `PropertyVideo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `floorPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `propertyAnalytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `propertyApplications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `propertyBoosts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `propertyPricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `propertyTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('IN_PROGRESS', 'READY', 'PUBLISHED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "ListingPurpose" AS ENUM ('RENT', 'SALE', 'LEASE', 'SHORT_LET');

-- CreateEnum
CREATE TYPE "ListingLifecycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'RENTED', 'SOLD', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FORMER');

-- CreateEnum
CREATE TYPE "BuyerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CONVERTED');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED');

-- CreateEnum
CREATE TYPE "LeaseTermType" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- DropForeignKey
ALTER TABLE "PropertyImages" DROP CONSTRAINT "PropertyImages_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyVideo" DROP CONSTRAINT "PropertyVideo_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "floorPlan" DROP CONSTRAINT "floorPlan_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_structureId_fkey";

-- DropForeignKey
ALTER TABLE "propertyAmenities" DROP CONSTRAINT "propertyAmenities_amenityId_fkey";

-- DropForeignKey
ALTER TABLE "propertyAmenities" DROP CONSTRAINT "propertyAmenities_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyAnalytics" DROP CONSTRAINT "propertyAnalytics_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyApplications" DROP CONSTRAINT "propertyApplications_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyBoosts" DROP CONSTRAINT "propertyBoosts_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyPricing" DROP CONSTRAINT "propertyPricing_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyTransactions" DROP CONSTRAINT "propertyTransactions_propertyId_fkey";

-- DropIndex
DROP INDEX "properties_slug_key";

-- DropIndex
DROP INDEX "properties_structureId_key";

-- DropIndex
DROP INDEX "propertyAnalytics_propertyId_key";

-- DropIndex
DROP INDEX "propertyPricing_propertyId_key";

-- AlterTable
ALTER TABLE "PropertyImages" DROP COLUMN "propertyId",
ADD COLUMN     "unitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyVideo" DROP COLUMN "propertyId",
ADD COLUMN     "unitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "agencyContact" DROP COLUMN "openingHours";

-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "imagesId" TEXT;

-- AlterTable
ALTER TABLE "floorPlan" DROP COLUMN "propertyId",
ADD COLUMN     "unitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "availability",
DROP COLUMN "availableFrom",
DROP COLUMN "buildingMaterial",
DROP COLUMN "category",
DROP COLUMN "ceilingType",
DROP COLUMN "condition",
DROP COLUMN "construction",
DROP COLUMN "cooling",
DROP COLUMN "customFeatures",
DROP COLUMN "customSpecifications",
DROP COLUMN "designType",
DROP COLUMN "economicClass",
DROP COLUMN "electricBilling",
DROP COLUMN "electricity",
DROP COLUMN "favorites",
DROP COLUMN "floorType",
DROP COLUMN "furnishing",
DROP COLUMN "heating",
DROP COLUMN "isPublished",
DROP COLUMN "landSizeSqm",
DROP COLUMN "progressStep",
DROP COLUMN "purpose",
DROP COLUMN "ratings",
DROP COLUMN "roofType",
DROP COLUMN "sizeSqm",
DROP COLUMN "slug",
DROP COLUMN "status",
DROP COLUMN "structureId",
DROP COLUMN "type",
DROP COLUMN "views",
DROP COLUMN "wallFinish",
DROP COLUMN "waterSupply",
DROP COLUMN "yearBuilt",
ADD COLUMN     "isMultiUnit" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "propertyAnalytics" DROP COLUMN "propertyId",
ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "propertyApplications" DROP COLUMN "propertyId",
ADD COLUMN     "buyersId" TEXT,
ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "propertyBoosts" DROP COLUMN "propertyId",
ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "propertyPricing" DROP COLUMN "propertyId",
ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "propertyTransactions" DROP COLUMN "propertyId",
ADD COLUMN     "buyerId" TEXT,
ADD COLUMN     "listingId" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT;

-- DropTable
DROP TABLE "propertyAmenities";

-- CreateTable
CREATE TABLE "agencySupport" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "openingHours" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencySupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listingDrafts" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "listingId" TEXT,
    "data" JSONB NOT NULL,
    "isMultiUnit" BOOLEAN NOT NULL DEFAULT false,
    "status" "DraftStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "lastSavedStep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "listingDrafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyUnitAmenities" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "propertyUnitAmenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyUnits" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitLabel" TEXT,
    "category" "PropertyCategory",
    "type" "PropertyType",
    "designType" "DesignType",
    "purpose" "PropertyPurpose",
    "economicClass" "EconomicClass",
    "customSpecifications" JSONB,
    "customFeatures" JSONB,
    "furnishing" "FurnishingStatus",
    "sizeSqm" DOUBLE PRECISION,
    "landSizeSqm" DOUBLE PRECISION,
    "yearBuilt" INTEGER,
    "condition" "ConditionStatus",
    "electricity" "ElectricityType",
    "electricBilling" "MeterType",
    "waterSupply" "WaterSupplyType",
    "cooling" "CoolingType",
    "heating" "HeatingType",
    "construction" "ConstructionStatus",
    "floorType" "FloorType",
    "roofType" "RoofType",
    "wallFinish" "WallFinish",
    "ceilingType" "CeilingType",
    "buildingMaterial" "BuildingMaterial",
    "structureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyUnits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "purpose" "ListingPurpose" NOT NULL,
    "status" "ListingLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "progressStep" "ListingStep" NOT NULL DEFAULT 'BASIC_INFO',
    "availability" "AvailabilityStatus",
    "availableFrom" TIMESTAMP(3),
    "ratings" DOUBLE PRECISION DEFAULT 0,
    "views" INTEGER DEFAULT 0,
    "favorites" INTEGER DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "BuyerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "termType" "LeaseTermType" NOT NULL DEFAULT 'YEARLY',
    "status" "LeaseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaseAgreements" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileId" TEXT,
    "signedByTenant" BOOLEAN NOT NULL DEFAULT false,
    "signedByAgency" BOOLEAN NOT NULL DEFAULT false,
    "tenantSignedAt" TIMESTAMP(3),
    "agencySignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "leaseAgreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "tenantId" TEXT,
    "listingId" TEXT,
    "leaseId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyInspections" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "agentId" TEXT,
    "requestedById" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "propertyInspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencySupport_agencyId_key" ON "agencySupport"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "listingDrafts_listingId_key" ON "listingDrafts"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "propertyUnitAmenities_unitId_amenityId_key" ON "propertyUnitAmenities"("unitId", "amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "propertyUnits_structureId_key" ON "propertyUnits"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_agencyId_userId_key" ON "tenants"("agencyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_agencyId_userId_key" ON "buyers"("agencyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "leaseAgreements_leaseId_key" ON "leaseAgreements"("leaseId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "propertyAnalytics_listingId_key" ON "propertyAnalytics"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "propertyPricing_listingId_key" ON "propertyPricing"("listingId");

-- AddForeignKey
ALTER TABLE "agencySupport" ADD CONSTRAINT "agencySupport_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listingDrafts" ADD CONSTRAINT "listingDrafts_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listingDrafts" ADD CONSTRAINT "listingDrafts_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyUnitAmenities" ADD CONSTRAINT "propertyUnitAmenities_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "propertyUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyUnitAmenities" ADD CONSTRAINT "propertyUnitAmenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyUnits" ADD CONSTRAINT "propertyUnits_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyUnits" ADD CONSTRAINT "propertyUnits_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "PropertyStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "propertyUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImages" ADD CONSTRAINT "PropertyImages_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "propertyUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyPricing" ADD CONSTRAINT "propertyPricing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyVideo" ADD CONSTRAINT "PropertyVideo_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "propertyUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floorPlan" ADD CONSTRAINT "floorPlan_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "propertyUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyAnalytics" ADD CONSTRAINT "propertyAnalytics_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyApplications" ADD CONSTRAINT "propertyApplications_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyApplications" ADD CONSTRAINT "propertyApplications_buyersId_fkey" FOREIGN KEY ("buyersId") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaseAgreements" ADD CONSTRAINT "leaseAgreements_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyBoosts" ADD CONSTRAINT "propertyBoosts_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyInspections" ADD CONSTRAINT "propertyInspections_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyInspections" ADD CONSTRAINT "propertyInspections_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyInspections" ADD CONSTRAINT "propertyInspections_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
