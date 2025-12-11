/*
  Warnings:

  - You are about to drop the column `brevoApiKey` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `brevoSenderEmail` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `brevoSenderName` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "brevoApiKey",
DROP COLUMN "brevoSenderEmail",
DROP COLUMN "brevoSenderName",
ADD COLUMN     "smtpFromEmail" TEXT,
ADD COLUMN     "smtpFromName" TEXT DEFAULT 'PM System',
ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPassword" TEXT,
ADD COLUMN     "smtpPort" INTEGER DEFAULT 587,
ADD COLUMN     "smtpUsername" TEXT;
