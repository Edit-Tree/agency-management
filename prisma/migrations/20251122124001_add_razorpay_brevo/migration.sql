/*
  Warnings:

  - You are about to drop the column `smtpFrom` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtpFromName` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtpHost` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtpPassword` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtpPort` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtpSecure` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `smtpUser` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `stripePublicKey` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSecretKey` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "smtpFrom",
DROP COLUMN "smtpFromName",
DROP COLUMN "smtpHost",
DROP COLUMN "smtpPassword",
DROP COLUMN "smtpPort",
DROP COLUMN "smtpSecure",
DROP COLUMN "smtpUser",
DROP COLUMN "stripePublicKey",
DROP COLUMN "stripeSecretKey",
ADD COLUMN     "brevoApiKey" TEXT,
ADD COLUMN     "brevoSenderEmail" TEXT,
ADD COLUMN     "brevoSenderName" TEXT DEFAULT 'PM System',
ADD COLUMN     "razorpayKeyId" TEXT,
ADD COLUMN     "razorpayKeySecret" TEXT;
