-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW', 'SAVE', 'INQUIRY', 'APPLY', 'RENT', 'SALE');

-- CreateTable
CREATE TABLE "userInteractions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userInteractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listingRecommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listingRecommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userInteractions_userId_idx" ON "userInteractions"("userId");

-- CreateIndex
CREATE INDEX "userInteractions_listingId_idx" ON "userInteractions"("listingId");

-- CreateIndex
CREATE INDEX "listingRecommendations_userId_score_idx" ON "listingRecommendations"("userId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "listingRecommendations_userId_listingId_key" ON "listingRecommendations"("userId", "listingId");
