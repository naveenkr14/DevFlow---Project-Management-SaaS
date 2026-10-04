-- DevFlow schema reconciliation migration.
-- This is a real migration: it creates the current schema on an empty database
-- and performs guarded, data-preserving conversion on the audited legacy schema.
-- It intentionally does not drop existing application data.

DO $migration$
BEGIN
  IF to_regclass('public."User"') IS NULL THEN
    EXECUTE $create$
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "IssuePriority" AS ENUM ('EASY', 'LOW', 'MEDIUM', 'HARD', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('ISSUE_CREATED', 'ISSUE_UPDATED', 'ISSUE_STATUS_CHANGED', 'ISSUE_ASSIGNED', 'ISSUE_PRIORITY_CHANGED', 'COMMENT_CREATED', 'COMMENT_UPDATED', 'COMMENT_DELETED', 'LABEL_CREATED', 'LABEL_UPDATED', 'LABEL_DELETED', 'LABEL_ADDED_TO_ISSUE', 'LABEL_REMOVED_FROM_ISSUE');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('ISSUE', 'COMMENT', 'LABEL');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'DEVELOPER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "issueCounter" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'TODO',
    "priority" "IssuePriority" NOT NULL DEFAULT 'MEDIUM',
    "reporterId" UUID NOT NULL,
    "assigneeId" UUID,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "issueId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueLabel" (
    "issueId" UUID NOT NULL,
    "labelId" UUID NOT NULL,

    CONSTRAINT "IssueLabel_pkey" PRIMARY KEY ("issueId","labelId")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "Project_workspaceId_updatedAt_idx" ON "Project"("workspaceId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_workspaceId_key_key" ON "Project"("workspaceId", "key");

-- CreateIndex
CREATE INDEX "Issue_projectId_status_priority_idx" ON "Issue"("projectId", "status", "priority");

-- CreateIndex
CREATE INDEX "Issue_assigneeId_status_idx" ON "Issue"("assigneeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_projectId_issueNumber_key" ON "Issue"("projectId", "issueNumber");

-- CreateIndex
CREATE INDEX "Comment_issueId_createdAt_idx" ON "Comment"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "Label_projectId_idx" ON "Label"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_projectId_name_key" ON "Label"("projectId", "name");

-- CreateIndex
CREATE INDEX "IssueLabel_labelId_idx" ON "IssueLabel"("labelId");

-- CreateIndex
CREATE INDEX "Activity_workspaceId_createdAt_idx" ON "Activity"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_entityType_entityId_idx" ON "Activity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLabel" ADD CONSTRAINT "IssueLabel_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueLabel" ADD CONSTRAINT "IssueLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
$create$;
  ELSE
    EXECUTE $reconcile$
-- Existing database reconciliation.
-- This branch is guarded by the observed legacy schema and aborts on an unexpected shape.

DO $guard$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Workspace'
      AND column_name = 'description'
  ) THEN
    RAISE EXCEPTION 'Unexpected Workspace schema; reconciliation stopped.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Issue'
      AND column_name = 'number'
  ) THEN
    RAISE EXCEPTION 'Unexpected Issue schema; reconciliation stopped.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Activity'
      AND column_name = 'actorId'
  ) THEN
    RAISE EXCEPTION 'Unexpected Activity schema; reconciliation stopped.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('Label', 'IssueLabel')
  ) THEN
    RAISE EXCEPTION 'Label tables already exist; reconciliation stopped.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "Activity"
    WHERE action::text <> 'STATUS_CHANGED'
       OR "issueId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Activity rows contain unsupported legacy actions or missing issue IDs; reconciliation stopped.';
  END IF;
END
$guard$;

CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

ALTER TABLE "Workspace"
  ADD COLUMN "ownerId" UUID;

UPDATE "Workspace" AS workspace
SET "ownerId" = admins."userId"
FROM (
  SELECT DISTINCT ON ("workspaceId")
    "workspaceId",
    "userId"
  FROM "WorkspaceMember"
  WHERE role = 'ADMIN'::"WorkspaceRole"
  ORDER BY "workspaceId", "createdAt", id
) AS admins
WHERE workspace.id = admins."workspaceId";

DO $owner_check$
BEGIN
  IF EXISTS (SELECT 1 FROM "Workspace" WHERE "ownerId" IS NULL) THEN
    RAISE EXCEPTION 'A workspace has no ADMIN membership; owner backfill stopped.';
  END IF;
END
$owner_check$;

ALTER TABLE "Workspace"
  ALTER COLUMN "ownerId" SET NOT NULL;

CREATE INDEX "Workspace_ownerId_idx"
  ON "Workspace"("ownerId");

ALTER TABLE "Issue"
  RENAME COLUMN "number" TO "issueNumber";

ALTER INDEX "Issue_projectId_number_key"
  RENAME TO "Issue_projectId_issueNumber_key";

ALTER TABLE "Project"
  ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "issueCounter" INTEGER NOT NULL DEFAULT 0;

UPDATE "Project" AS project
SET "issueCounter" = COALESCE((
  SELECT MAX(issue."issueNumber")
  FROM "Issue" AS issue
  WHERE issue."projectId" = project.id
), 0);

ALTER TABLE "Comment"
  RENAME COLUMN "body" TO "content";

ALTER TABLE "Comment"
  DROP CONSTRAINT "Comment_authorId_fkey";

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Label" (
  "id" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Label_projectId_name_key"
  ON "Label"("projectId", "name");

CREATE INDEX "Label_projectId_idx"
  ON "Label"("projectId");

CREATE TABLE "IssueLabel" (
  "issueId" UUID NOT NULL,
  "labelId" UUID NOT NULL,
  CONSTRAINT "IssueLabel_pkey" PRIMARY KEY ("issueId", "labelId")
);

CREATE INDEX "IssueLabel_labelId_idx"
  ON "IssueLabel"("labelId");

ALTER TYPE "ActivityAction"
  RENAME TO "ActivityAction_legacy";

CREATE TYPE "ActivityAction" AS ENUM (
  'ISSUE_CREATED',
  'ISSUE_UPDATED',
  'ISSUE_STATUS_CHANGED',
  'ISSUE_ASSIGNED',
  'ISSUE_PRIORITY_CHANGED',
  'COMMENT_CREATED',
  'COMMENT_UPDATED',
  'COMMENT_DELETED',
  'LABEL_CREATED',
  'LABEL_UPDATED',
  'LABEL_DELETED',
  'LABEL_ADDED_TO_ISSUE',
  'LABEL_REMOVED_FROM_ISSUE'
);

CREATE TYPE "ActivityEntityType" AS ENUM (
  'ISSUE',
  'COMMENT',
  'LABEL'
);

ALTER TABLE "Activity"
  RENAME COLUMN "actorId" TO "userId";

ALTER TABLE "Activity"
  RENAME COLUMN "issueId" TO "entityId";

ALTER TABLE "Activity"
  ADD COLUMN "entityType" "ActivityEntityType";

ALTER TABLE "Activity"
  DROP CONSTRAINT "Activity_actorId_fkey",
  DROP CONSTRAINT "Activity_issueId_fkey";

ALTER TABLE "Activity"
  ALTER COLUMN "action" TYPE TEXT
  USING action::text;

UPDATE "Activity"
SET
  "action" = 'ISSUE_STATUS_CHANGED',
  "entityType" = 'ISSUE'::"ActivityEntityType";

ALTER TABLE "Activity"
  ALTER COLUMN "action" TYPE "ActivityAction"
  USING action::"ActivityAction";

ALTER TABLE "Activity"
  ALTER COLUMN "entityType" SET NOT NULL,
  ALTER COLUMN "entityId" SET NOT NULL;

ALTER TABLE "Activity"
  ADD CONSTRAINT "Activity_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Activity_userId_idx"
  ON "Activity"("userId");

CREATE INDEX "Activity_entityType_entityId_idx"
  ON "Activity"("entityType", "entityId");

CREATE INDEX "Activity_createdAt_idx"
  ON "Activity"("createdAt");

ALTER TABLE "Label"
  ADD CONSTRAINT "Label_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueLabel"
  ADD CONSTRAINT "IssueLabel_issueId_fkey"
  FOREIGN KEY ("issueId") REFERENCES "Issue"(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IssueLabel"
  ADD CONSTRAINT "IssueLabel_labelId_fkey"
  FOREIGN KEY ("labelId") REFERENCES "Label"(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

DROP TYPE "ActivityAction_legacy";
$reconcile$;
  END IF;
END
$migration$;
