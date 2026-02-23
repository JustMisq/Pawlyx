-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "monthlySMSLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlySMSUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smsLastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "smsOverageCost" DOUBLE PRECISION NOT NULL DEFAULT 0.008;

-- CreateTable
CREATE TABLE "SMSLog" (
    "id" TEXT NOT NULL,
    "toPhone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "messageId" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.004,
    "type" TEXT NOT NULL,
    "appointmentId" TEXT,
    "clientId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOverage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "SMSLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SMSLog_salonId_idx" ON "SMSLog"("salonId");

-- CreateIndex
CREATE INDEX "SMSLog_userId_idx" ON "SMSLog"("userId");

-- CreateIndex
CREATE INDEX "SMSLog_clientId_idx" ON "SMSLog"("clientId");

-- CreateIndex
CREATE INDEX "SMSLog_status_idx" ON "SMSLog"("status");

-- CreateIndex
CREATE INDEX "SMSLog_createdAt_idx" ON "SMSLog"("createdAt");

-- CreateIndex
CREATE INDEX "SMSLog_isOverage_idx" ON "SMSLog"("isOverage");
