-- AddColumn pour les champs flexible pricing et observations
ALTER TABLE "Appointment" ADD COLUMN "finalPrice" DOUBLE PRECISION;
ALTER TABLE "Appointment" ADD COLUMN "finalDuration" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "observations" TEXT;
