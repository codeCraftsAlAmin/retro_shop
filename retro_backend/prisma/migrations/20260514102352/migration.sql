/*
  Warnings:

  - A unique constraint covering the columns `[productId,size]` on the table `varitents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "varitents_productId_size_key" ON "varitents"("productId", "size");
