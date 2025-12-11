-- CreateTable
CREATE TABLE "RevisionHistory" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevisionHistory_ticketId_idx" ON "RevisionHistory"("ticketId");

-- AddForeignKey
ALTER TABLE "RevisionHistory" ADD CONSTRAINT "RevisionHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionHistory" ADD CONSTRAINT "RevisionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
