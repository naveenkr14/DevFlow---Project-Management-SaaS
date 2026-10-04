-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('ISSUE_CREATED', 'ISSUE_UPDATED', 'ISSUE_STATUS_CHANGED', 'ISSUE_ASSIGNED', 'ISSUE_PRIORITY_CHANGED', 'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_DELETED', 'LABEL_CREATED', 'LABEL_UPDATED', 'LABEL_DELETED', 'LABEL_ADDED_TO_ISSUE', 'LABEL_REMOVED_FROM_ISSUE');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('ISSUE', 'COMMENT', 'LABEL');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_entityType_entityId_idx" ON "Activity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
