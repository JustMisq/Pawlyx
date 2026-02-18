-- Ajouter les champs type et items à Invoice
ALTER TABLE "Invoice" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'appointment';
ALTER TABLE "Invoice" ADD COLUMN "items" TEXT;
CREATE INDEX "Invoice_type_idx" ON "Invoice"("type");
