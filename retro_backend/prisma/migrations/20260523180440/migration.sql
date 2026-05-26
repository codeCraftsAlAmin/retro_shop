/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the `varitents` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productVariantId,customerId]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId,productVariantId]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "varitents" DROP CONSTRAINT "varitents_productId_fkey";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "emailVerified";

-- AlterTable
ALTER TABLE "sellers" DROP COLUMN "emailVerified";

-- DropTable
DROP TABLE "varitents";

-- CreateTable
CREATE TABLE "variants" (
    "id" TEXT NOT NULL,
    "size" "Size" NOT NULL DEFAULT 'S',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "variants_productId_idx" ON "variants"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "variants_productId_size_key" ON "variants"("productId", "size");

-- CreateIndex
CREATE INDEX "carts_customerId_idx" ON "carts"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_productVariantId_customerId_key" ON "carts"("productVariantId", "customerId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productVariantId_idx" ON "order_items"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_orderId_productVariantId_key" ON "order_items"("orderId", "productVariantId");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "products_sellerId_idx" ON "products"("sellerId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- AddForeignKey
ALTER TABLE "variants" ADD CONSTRAINT "variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
