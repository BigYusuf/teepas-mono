/*
  Warnings:

  - The values [HOME_SLIDER_1RELEASED] on the enum `EscrowStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[flwTransactionId]` on the table `escrowPayments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "EscrowStatus_new" AS ENUM ('PENDING_PAYMENT', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED', 'CANCELLED');
ALTER TABLE "escrowPayments" ALTER COLUMN "status" TYPE "EscrowStatus_new" USING ("status"::text::"EscrowStatus_new");
ALTER TYPE "EscrowStatus" RENAME TO "EscrowStatus_old";
ALTER TYPE "EscrowStatus_new" RENAME TO "EscrowStatus";
DROP TYPE "EscrowStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "agencyBankAccounts" DROP CONSTRAINT "agencyBankAccounts_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "escrowPayments" DROP CONSTRAINT "escrowPayments_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "leases" DROP CONSTRAINT "leases_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyPricing" DROP CONSTRAINT "propertyPricing_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "propertyTransactions" DROP CONSTRAINT "propertyTransactions_currencyId_fkey";

-- AlterTable
ALTER TABLE "agencyBankAccounts" ALTER COLUMN "currencyId" SET DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "escrowPayments" ADD COLUMN     "flwTransactionId" TEXT,
ALTER COLUMN "currencyId" SET DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "currencyId" SET DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "leases" ALTER COLUMN "currencyId" SET DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "propertyPricing" ALTER COLUMN "currencyId" SET DEFAULT 'NGN';

-- AlterTable
ALTER TABLE "propertyTransactions" ALTER COLUMN "currencyId" SET DEFAULT 'NGN';

-- CreateTable
CREATE TABLE "agencyWallets" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "agencyWallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walletTransactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" DECIMAL(14,2) NOT NULL,
    "balanceBefore" DECIMAL(14,2) NOT NULL,
    "balanceAfter" DECIMAL(14,2) NOT NULL,
    "reference" TEXT,
    "purpose" TEXT,
    "note" TEXT,
    "escrowPaymentId" TEXT,
    "withdrawalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walletTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "flwTransferId" TEXT,
    "failureReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencyWallets_agencyId_currencyId_key" ON "agencyWallets"("agencyId", "currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "walletTransactions_reference_key" ON "walletTransactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_flwTransferId_key" ON "withdrawals"("flwTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "escrowPayments_flwTransactionId_key" ON "escrowPayments"("flwTransactionId");

-- AddForeignKey
ALTER TABLE "agencyBankAccounts" ADD CONSTRAINT "agencyBankAccounts_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyPricing" ADD CONSTRAINT "propertyPricing_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyTransactions" ADD CONSTRAINT "propertyTransactions_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrowPayments" ADD CONSTRAINT "escrowPayments_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyWallets" ADD CONSTRAINT "agencyWallets_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencyWallets" ADD CONSTRAINT "agencyWallets_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walletTransactions" ADD CONSTRAINT "walletTransactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "agencyWallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "agencyWallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "agencyBankAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
