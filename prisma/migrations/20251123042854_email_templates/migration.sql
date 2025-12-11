-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "enableInvoiceEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paymentReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paymentReminderMessage" TEXT DEFAULT 'This is a gentle reminder that invoice {invoice_number} for {amount} is pending payment. Please process the payment at your earliest convenience. Thank you!';
