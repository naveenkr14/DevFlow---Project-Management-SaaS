-- Add workspaceId as nullable first so existing Activity rows can be backfilled.
ALTER TABLE "Activity"
ADD COLUMN "workspaceId" TEXT;

-- ============================================================
-- Backfill ISSUE activities
-- Activity -> Issue -> Project -> Workspace
-- ============================================================

UPDATE "Activity" AS activity
SET "workspaceId" = project."workspaceId"
FROM "Issue" AS issue
JOIN "Project" AS project
  ON project."id" = issue."projectId"
WHERE activity."entityType" = 'ISSUE'
  AND activity."entityId" = issue."id"
  AND activity."workspaceId" IS NULL;


-- ============================================================
-- Backfill COMMENT activities
-- Activity -> Comment -> Issue -> Project -> Workspace
-- ============================================================

UPDATE "Activity" AS activity
SET "workspaceId" = project."workspaceId"
FROM "Comment" AS comment
JOIN "Issue" AS issue
  ON issue."id" = comment."issueId"
JOIN "Project" AS project
  ON project."id" = issue."projectId"
WHERE activity."entityType" = 'COMMENT'
  AND activity."entityId" = comment."id"
  AND activity."workspaceId" IS NULL;


-- ============================================================
-- Backfill LABEL activities
-- Activity -> Label -> Project -> Workspace
-- ============================================================

UPDATE "Activity" AS activity
SET "workspaceId" = project."workspaceId"
FROM "Label" AS label
JOIN "Project" AS project
  ON project."id" = label."projectId"
WHERE activity."entityType" = 'LABEL'
  AND activity."entityId" = label."id"
  AND activity."workspaceId" IS NULL;


-- ============================================================
-- Fallback for deleted COMMENT activities
--
-- COMMENT_DELETED activities may point to a comment that
-- no longer exists.
--
-- The activity metadata contains issueId, so we can still
-- determine the workspace:
--
-- Activity -> metadata.issueId -> Issue -> Project -> Workspace
-- ============================================================

UPDATE "Activity" AS activity
SET "workspaceId" = project."workspaceId"
FROM "Issue" AS issue
JOIN "Project" AS project
  ON project."id" = issue."projectId"
WHERE activity."entityType" = 'COMMENT'
  AND activity."workspaceId" IS NULL
  AND activity."metadata"->>'issueId' = issue."id";


-- ============================================================
-- Fallback for deleted LABEL activities
--
-- LABEL_DELETED activities may point to a label that
-- no longer exists.
--
-- The activity metadata contains projectId.
-- ============================================================

UPDATE "Activity" AS activity
SET "workspaceId" = project."workspaceId"
FROM "Project" AS project
WHERE activity."entityType" = 'LABEL'
  AND activity."workspaceId" IS NULL
  AND activity."metadata"->>'projectId' = project."id";


-- ============================================================
-- Safety check
--
-- If any Activity row still has NULL workspaceId,
-- stop the migration instead of creating bad data.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Activity"
    WHERE "workspaceId" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Migration stopped: one or more Activity records could not be assigned a workspaceId.';
  END IF;
END $$;


-- ============================================================
-- Make workspaceId required
-- ============================================================

ALTER TABLE "Activity"
ALTER COLUMN "workspaceId" SET NOT NULL;


-- ============================================================
-- Add Workspace foreign key
-- ============================================================

ALTER TABLE "Activity"
ADD CONSTRAINT "Activity_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "Workspace"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;


-- ============================================================
-- Add workspace activity feed index
-- ============================================================

CREATE INDEX "Activity_workspaceId_createdAt_idx"
ON "Activity"("workspaceId", "createdAt");