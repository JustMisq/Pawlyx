-- CreateTable InventoryCategory
CREATE TABLE "InventoryCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "salonId" TEXT NOT NULL,
    CONSTRAINT "InventoryCategory_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon" ("id") ON DELETE CASCADE
);

-- AddColumn categoryId to InventoryItem
ALTER TABLE "InventoryItem" ADD COLUMN "categoryId" TEXT;

-- CreateIndex InventoryCategory_salonId_idx
CREATE INDEX "InventoryCategory_salonId_idx" ON "InventoryCategory"("salonId");

-- CreateIndex InventoryCategory_salonId_name_key (UNIQUE constraint)
CREATE UNIQUE INDEX "InventoryCategory_salonId_name_key" ON "InventoryCategory"("salonId", "name");

-- CreateIndex InventoryItem_categoryId_idx
CREATE INDEX "InventoryItem_categoryId_idx" ON "InventoryItem"("categoryId");

-- AddForeignKey InventoryItem.categoryId
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory" ("id") ON DELETE SET NULL;
