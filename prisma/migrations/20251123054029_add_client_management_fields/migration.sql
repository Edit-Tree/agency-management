-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "brandingKitUrl" TEXT,
ADD COLUMN     "knowledgeBaseUrl" TEXT;

-- CreateTable
CREATE TABLE "ClientTeamMember" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientTeamMember_clientProfileId_userId_key" ON "ClientTeamMember"("clientProfileId", "userId");

-- AddForeignKey
ALTER TABLE "ClientTeamMember" ADD CONSTRAINT "ClientTeamMember_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTeamMember" ADD CONSTRAINT "ClientTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
