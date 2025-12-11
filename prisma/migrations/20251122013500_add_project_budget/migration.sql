-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "budget" DECIMAL(65,30),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';
