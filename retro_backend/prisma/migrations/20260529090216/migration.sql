-- AlterTable
ALTER TABLE "products" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "products_teamName_idx" ON "products"("teamName");

-- CreateIndex
CREATE INDEX "products_year_idx" ON "products"("year");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");
