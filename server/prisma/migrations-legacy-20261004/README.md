# Archived Prisma migrations

These migrations are preserved unchanged for historical reference. They describe
a schema generation that was never applied to the authoritative PostgreSQL
database and are intentionally outside Prisma's active migrations path.

The active migration path contains the guarded
`20261004100800_reconcile_existing_schema` migration. It creates the current
schema on a new database and reconciles the audited legacy schema without
discarding existing data.
