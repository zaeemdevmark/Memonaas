-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "reservedStock" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "product_variants_reservedStock_idx" ON "product_variants"("reservedStock");
