DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Workspace_ownerId_fkey'
      AND conrelid = '"Workspace"'::regclass
  ) THEN
    ALTER TABLE "Workspace"
      ADD CONSTRAINT "Workspace_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User"(id)
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;
