-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "emailOnCommentAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailOnDeadlineApproaching" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnInvoiceCreated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnInvoicePaid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnProjectCreated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailOnReviewApproved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnReviewRequested" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnTicketAssigned" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnTicketCreated" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailOnTicketStatusChange" BOOLEAN NOT NULL DEFAULT false;
