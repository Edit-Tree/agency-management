-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "deadline" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpFrom" TEXT,
    "smtpFromName" TEXT DEFAULT 'PM System',
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "stripeSecretKey" TEXT,
    "stripePublicKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
