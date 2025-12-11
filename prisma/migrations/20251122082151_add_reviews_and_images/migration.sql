-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "clientReview" TEXT,
ADD COLUMN     "rating" INTEGER;
