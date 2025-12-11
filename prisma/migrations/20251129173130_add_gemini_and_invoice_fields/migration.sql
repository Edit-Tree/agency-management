-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "issueDate" TIMESTAMP(3),
ADD COLUMN     "proformaDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "geminiApiKey" TEXT;
