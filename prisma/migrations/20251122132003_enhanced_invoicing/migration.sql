/*
  Warnings:

  - You are about to drop the column `issueDate` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `proformaDate` on the `Invoice` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Invoice_invoiceNumber_key";

-- DropIndex
DROP INDEX "Invoice_proformaNumber_key";

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "vatNumber" TEXT;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "issueDate",
DROP COLUMN "proformaDate",
ADD COLUMN     "clientGstNumber" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "taxType" TEXT DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DECIMAL(65,30) NOT NULL DEFAULT 0;
