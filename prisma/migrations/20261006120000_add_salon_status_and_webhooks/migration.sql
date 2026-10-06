-- AddColumn: estado do salão (active | inactive | suspended)
ALTER TABLE "Salon" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable: webhooks configuráveis a partir do painel de administração
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "severityLevel" TEXT NOT NULL DEFAULT 'critical',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "retries" INTEGER NOT NULL DEFAULT 3,
    "lastStatus" TEXT,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Webhook_enabled_idx" ON "Webhook"("enabled");

-- CreateIndex: le calendrier et les relatórios filtrent toujours par salão + intervalo de datas
CREATE INDEX "Appointment_salonId_startTime_idx" ON "Appointment"("salonId", "startTime");
