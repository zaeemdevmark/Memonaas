# Disaster Recovery Plan — Memonaas

## Overview

This document describes backup types, recovery procedures, and estimated
recovery times for the Memonaas e-commerce platform.

Database: PostgreSQL 16  
ORM: Prisma 7  
Backup tool: `pg_dump` (full) + pg client incremental snapshots

---

## Backup Types

### Full Backup
- **File format**: PostgreSQL custom format (`.dump`) — compressed binary
- **Tool**: `pg_dump --format=custom --compress=6`
- **Restore**: `pg_restore --clean --if-exists`
- **Contents**: Complete database — schema + all data + sequences + indexes
- **Schedule**: Daily (2 AM) and weekly (Sunday 1 AM)
- **Typical size**: 5–50 MB depending on product catalogue and order volume

### Incremental Backup
- **File format**: JSON snapshot of changed rows
- **Method**: Queries rows where `updatedAt >= last_full_backup_time` across
  all tables that carry a timestamp column
- **Schedule**: Every 6 hours
- **Typical size**: 10 KB – 2 MB
- **Limitation**: Cannot capture rows in tables without timestamp columns
  (e.g., `verification_tokens`). Those are covered by the next full backup.

---

## Recovery Time Objectives

| Scenario                     | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) |
|------------------------------|-------------------------------|-------------------------------|
| Restore full backup          | 5–15 minutes                  | Up to 24 hours of data loss   |
| Restore full + incremental   | 10–20 minutes                 | Up to 6 hours of data loss    |
| Schema-only migration issue  | 1–5 minutes                   | Zero data loss                |
| Accidental row deletion      | 2–10 minutes (incremental)    | Up to 6 hours of data loss    |

> These are estimates for a database under 500 MB. Larger databases will
> take proportionally longer. Measure your actual restore time in staging
> before relying on these numbers in production.

---

## Pre-Restore Checklist

Before restoring any backup, confirm the following:

- [ ] You have a **current backup** of the database you are about to overwrite
      (`npm run backup:full` before restoring)
- [ ] You know the **exact backup ID** to restore
      (`npm run backup:list`)
- [ ] The backup **integrity check passes**
      (`npm run backup:validate <id>`)
- [ ] The application server is **stopped or in maintenance mode**
      to prevent writes during restore
- [ ] You have confirmed the **target DATABASE_URL** matches the intended
      environment (never restore prod backup to prod without a second backup)
- [ ] Team members who may be writing to the database have been notified

---

## Restore Procedures

### Scenario 1 — Full Restore (most common)

Use this when the database is corrupted, accidentally dropped, or needs to
be migrated to a new server.

```bash
# 1. List available backups
npm run backup:list

# 2. Validate the backup you intend to restore
npm run backup:validate <backup-id>

# 3. Stop the application (prevents new writes during restore)
#    e.g. pm2 stop memonaas  OR  shut down the Next.js process

# 4. Restore
npm run backup:restore <backup-id>

# 5. Run migrations in case the schema changed since the backup
npm run db:migrate:prod

# 6. Restart the application
#    pm2 start memonaas  OR  npm start
```

Estimated time: **5–15 minutes**

---

### Scenario 2 — Incremental Restore (targeted recovery)

Use this to recover data lost since the last full backup (e.g., an accidental
bulk delete) without rolling back the entire database.

The restore script automatically applies the incremental delta on top of its
parent full backup — you only need to provide the incremental backup ID.

```bash
# 1. Find the incremental backup closest to the point you want to recover
npm run backup:list

# 2. Validate it
npm run backup:validate <incremental-id>

# 3. Stop writes (prevent the restore being overwritten immediately)

# 4. Restore — applies parent full backup + the incremental delta
npm run backup:restore <incremental-id>

# 5. Re-run pending migrations if needed
npm run db:migrate:prod

# 6. Restart the application
```

Estimated time: **10–20 minutes**

---

### Scenario 3 — Partial Restore (single table recovery)

When only one table is affected (e.g., the `orders` table was corrupted),
you can apply a targeted incremental backup rather than restoring the whole
database.

This requires a custom script. Example using psql:

```bash
# 1. Dump just the affected table from the backup file
pg_restore \
  --table=orders \
  --data-only \
  --no-privileges \
  --no-owner \
  --file=orders_only.sql \
  backups/full_<timestamp>_<id>.dump

# 2. TRUNCATE the target table (if you want a clean slate) and re-import
psql $DATABASE_URL < orders_only.sql
```

Or use the JSON incremental backup — it contains individual table data that
can be inspected and selectively re-inserted.

---

### Scenario 4 — New Server Migration

When moving to a new PostgreSQL server:

```bash
# On the old server
npm run backup:full

# Transfer the dump file to the new server via scp / S3 / rsync
scp backups/full_<timestamp>_<id>.dump user@new-server:/backups/

# On the new server — create an empty database first
psql -c "CREATE DATABASE memonaas;" postgres

# Restore
pg_restore \
  --host=NEW_HOST \
  --username=USER \
  --dbname=memonaas \
  --no-owner \
  --no-privileges \
  backups/full_<timestamp>_<id>.dump

# Update DATABASE_URL in .env and deploy migrations
npm run db:migrate:prod
```

---

## Post-Restore Verification

After any restore, verify these critical paths before reopening to customers:

```bash
# 1. Check database connectivity
npx prisma db execute --stdin <<< "SELECT 1;"

# 2. Count key tables to confirm data is present
npx prisma db execute --stdin <<< "
  SELECT
    (SELECT count(*) FROM users)     AS users,
    (SELECT count(*) FROM products)  AS products,
    (SELECT count(*) FROM orders)    AS orders,
    (SELECT count(*) FROM payments)  AS payments;
"

# 3. Start the dev server and manually test:
#    - Login as admin (admin@memonaas.com)
#    - Product listing page loads
#    - Checkout flow completes
#    - Admin dashboard shows order counts
```

---

## Backup Environment Variables

| Variable              | Default            | Description                              |
|-----------------------|--------------------|------------------------------------------|
| `BACKUP_PATH`         | `./backups`        | Directory where backup files are stored  |
| `BACKUP_RETENTION_DAYS` | `30`             | Days before backups are auto-deleted     |
| `PG_DUMP_BIN`         | `pg_dump`          | Path to pg_dump binary                   |
| `PG_RESTORE_BIN`      | `pg_restore`       | Path to pg_restore binary                |

**Windows note**: If `pg_dump` is not in `PATH`, add the PostgreSQL bin
directory:
```
C:\Program Files\PostgreSQL\16\bin
```
Or set `PG_DUMP_BIN` to the full path in `.env`:
```
PG_DUMP_BIN="C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
PG_RESTORE_BIN="C:\Program Files\PostgreSQL\16\bin\pg_restore.exe"
```

---

## npm Scripts Reference

| Script                        | Description                                        |
|-------------------------------|----------------------------------------------------|
| `npm run backup:full`         | Create a full pg_dump backup immediately           |
| `npm run backup:incremental`  | Create an incremental backup (requires full first) |
| `npm run backup:list`         | List all backups from the manifest                 |
| `npm run backup:validate`     | Validate checksums of all completed backups        |
| `npm run backup:restore <id>` | Restore from a specific backup (interactive)       |
| `npm run backup:scheduler`    | Start the scheduler daemon (daily/weekly/6h)       |

---

## Cloud Backup (Future)

Cloud backup support is stubbed in `lib/backup/storage/cloud.ts`. To enable:

1. Install your cloud SDK (`@aws-sdk/client-s3`, `@google-cloud/storage`, etc.)
2. Implement `uploadBackup` and `downloadBackup` in that file
3. Add the required env vars (see the file header for details)
4. Call `uploadBackup` from `lib/backup/service.ts` after each local backup completes

Recommended strategy: keep 7-day local backups + 90-day cloud backups for
cost-effective disaster recovery coverage.

---

## Contact

In a production incident, follow this escalation path:

1. Confirm the scope (data loss vs corruption vs connectivity)
2. Take a snapshot backup of the current (damaged) state for forensics
3. Execute the appropriate restore procedure above
4. Document the incident timeline and root cause
