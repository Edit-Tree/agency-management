/*
  Warnings:

  - A unique constraint covering the columns `[proformaNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rate` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE 'PROFORMA';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paidDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "proformaDate" TIMESTAMP(3),
ADD COLUMN     "proformaNumber" INTEGER;

-- AlterTable
-- First add columns with defaults
ALTER TABLE "InvoiceItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
ADD COLUMN     "rate" DECIMAL(65,30);

-- Set rate to existing amount for existing rows (since quantity defaults to 1)
UPDATE "InvoiceItem" SET "rate" = "amount" WHERE "rate" IS NULL;

-- Now make rate required
ALTER TABLE "InvoiceItem" ALTER COLUMN "rate" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_proformaNumber_key" ON "Invoice"("proformaNumber");
