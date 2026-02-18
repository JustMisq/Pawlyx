-- StockSale table pour tracker les ventes d'inventaire
CREATE TABLE "StockSale" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quantity" INTEGER NOT NULL,
  "pricePerUnit" DOUBLE PRECISION NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  "salonId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "inventoryItemId" TEXT NOT NULL,
  "invoiceId" TEXT,
  
  FOREIGN KEY ("salonId") REFERENCES "Salon" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL
);

CREATE INDEX "StockSale_salonId_idx" ON "StockSale"("salonId");
CREATE INDEX "StockSale_clientId_idx" ON "StockSale"("clientId");
CREATE INDEX "StockSale_inventoryItemId_idx" ON "StockSale"("inventoryItemId");
CREATE INDEX "StockSale_invoiceId_idx" ON "StockSale"("invoiceId");
