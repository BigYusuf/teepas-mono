/*
  Warnings:

  - You are about to drop the column `currency` on the `agencyBankAccounts` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `creditTransactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `balanceBefore` on the `creditTransactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `balanceAfter` on the `creditTransactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - You are about to alter the column `rentAmount` on the `leases` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - You are about to drop the column `agentFee` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `cautionFee` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `legalFee` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCharge` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `propertyPricing` table. All the data in the column will be lost.
  - You are about to alter the column `basePrice` on the `propertyPricing` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - You are about to alter the column `amount` on the `propertyTransactions` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - Added the required column `currencyId` to the `agencyBankAccounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `leases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `propertyPricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `propertyTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PricingFeeType" AS ENUM ('SECURITY_DEPOSIT', 'AGENT_FEE', 'APPLICATION_FEE', 'LEGAL_FEE', 'SERVICE_CHARGE', 'STAMP_DUTY', 'VAT', 'OTHER');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING_PAYMENT', 'HOME_SLIDER_1RELEASED', 'REFUNDED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EscrowPurpose" AS ENUM ('INSPECTION_FEE', 'RENT_PAYMENT', 'PURCHASE_PAYMENT', 'CAUTION_FEE', 'SERVICE_CHARGE');

-- AlterTable
ALTER TABLE "agencyBankAccounts" DROP COLUMN "currency",
ADD COLUMN     "currencyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "creditTransactions" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "balanceBefore" SET DATA TYPE INTEGER,
ALTER COLUMN "balanceAfter" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "currencyId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "currencyId" TEXT NOT NULL,
ALTER COLUMN "rentAmount" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "propertyPricing" DROP COLUMN "agentFee",
DROP COLUMN "cautionFee",
DROP COLUMN "createdAt",
DROP COLUMN "currency",
DROP COLUMN "legalFee",
DROP COLUMN "serviceCharge",
DROP COLUMN "updatedAt",
ADD COLUMN     "currencyId" TEXT NOT NULL,
ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "propertyTransactions" ADD COLUMN     "currencyId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);

-- CreateTable
CREATE TABLE "propertyPricingFees" (
    "id" TEXT NOT NULL,
    "pricingId" TEXT NOT NULL,
    "label" TEXT,
    "type" "PricingFeeType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "propertyPricingFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrowPayments" (
    "id" TEXT NOT NULL,
    "purpose" "EscrowPurpose" NOT NULL,
    "status" "EscrowStatus" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "listingId" TEXT,
    "inspectionId" TEXT,
    "leaseId" TEXT,
    "paymentRef" TEXT,
    "gatewayName" TEXT DEFAULT 'flutterwave',
    "paidAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "payerConfirmedAt" TIMESTAMP(3),
    "agencyConfirmedAt" TIMESTAMP(3),
    "autoReleaseAt" TIMESTAMP(3),
    "disputeReason" TEXT,
    "disputedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "escrowPayments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "propertyPricingFees_pricingId_key" ON "propertyPricingFees"("pricingId");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "escrowPayments_paymentRef_key" ON "escrowPayments"("paymentRef");

-- AddForeignKey
ALTER TABLE "agencyBankAccounts" ADD CONSTRAINT "agencyBankAccounts_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyPricingFees" ADD CONSTRAINT "propertyPricingFees_pricingId_fkey" FOREIGN KEY ("pricingId") REFERENCES "propertyPricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyPricing" ADD CONSTRAINT "propertyPricing_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "propertyInspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
