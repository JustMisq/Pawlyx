-- CreateTable
CREATE TABLE "SMSReminder" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "triggerHours" INTEGER NOT NULL DEFAULT 24,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTriggered" TIMESTAMP(3),

    CONSTRAINT "SMSReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SMSReminder_salonId_type_key" ON "SMSReminder"("salonId", "type");
