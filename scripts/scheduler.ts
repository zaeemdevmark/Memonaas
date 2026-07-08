#!/usr/bin/env node
// Backup scheduler daemon — run via: npm run backup:scheduler
// Runs as a long-lived process. Checks every minute whether any
// schedule is due and executes the backup automatically.
// Persists schedule state in backup-manifest.json so restarts don't
// re-run a backup that already completed in the current window.

import "dotenv/config";
import { createFullBackup, createIncrementalBackup, pruneExpired } from "../lib/backup/service";
import { getConfig }       from "../lib/backup/config";
import * as manifestStore  from "../lib/backup/manifest";
import { log }             from "../lib/backup/logger";

interface Schedule {
  name:        string;
  type:        "full" | "incremental";
  intervalMs:  number;
  description: string;
}

// Three schedules: daily full, weekly full, 6-hourly incremental.
// Intervals are checked on each tick (every CHECK_INTERVAL_MS).
const SCHEDULES: Schedule[] = [
  {
    name:        "daily-full",
    type:        "full",
    intervalMs:  24 * 60 * 60 * 1_000,
    description: "Daily full backup",
  },
  {
    name:        "weekly-full",
    type:        "full",
    intervalMs:  7 * 24 * 60 * 60 * 1_000,
    description: "Weekly full backup",
  },
  {
    name:        "incremental-6h",
    type:        "incremental",
    intervalMs:  6 * 60 * 60 * 1_000,
    description: "6-hourly incremental backup",
  },
];

const CHECK_INTERVAL_MS = 60 * 1_000; // evaluate schedules every minute

async function isDue(schedule: Schedule, backupPath: string): Promise<boolean> {
  const lastRun = await manifestStore.getScheduleLastRun(backupPath, schedule.name);
  if (!lastRun) return true; // never run — fire immediately
  return Date.now() - new Date(lastRun).getTime() >= schedule.intervalMs;
}

async function runSchedule(schedule: Schedule, backupPath: string): Promise<void> {
  log.info(`Running scheduled backup: ${schedule.description}`, { schedule: schedule.name });

  const result =
    schedule.type === "full"
      ? await createFullBackup()
      : await createIncrementalBackup();

  if (result.ok) {
    await manifestStore.setScheduleLastRun(backupPath, schedule.name, new Date().toISOString());
    log.info("Scheduled backup succeeded", {
      schedule: schedule.name,
      backupId: result.metadata?.id,
      sizeBytes: result.metadata?.fileSizeBytes,
    });
  } else {
    log.error("Scheduled backup failed", undefined, {
      schedule: schedule.name,
      error:    result.error,
    });
  }
}

async function tick(backupPath: string): Promise<void> {
  for (const schedule of SCHEDULES) {
    if (await isDue(schedule, backupPath)) {
      await runSchedule(schedule, backupPath);
    }
  }

  // After each tick, evict backups older than the retention window
  const pruned = await pruneExpired();
  if (pruned.deletedCount > 0) {
    log.info("Pruned expired backups", {
      count:   pruned.deletedCount,
      freedMB: (pruned.freedBytes / 1_048_576).toFixed(1),
    });
  }
}

async function printStatus(backupPath: string): Promise<void> {
  console.log("\nSchedule status:");
  for (const s of SCHEDULES) {
    const last = await manifestStore.getScheduleLastRun(backupPath, s.name);
    const nextMs = last
      ? new Date(last).getTime() + s.intervalMs
      : Date.now();
    const nextAt = new Date(Math.max(nextMs, Date.now())).toISOString();
    console.log(`  ${s.name.padEnd(20)} last: ${last ?? "never"}`);
    console.log(`  ${"".padEnd(20)} next: ${nextAt}`);
  }
  console.log();
}

async function main(): Promise<void> {
  const config = getConfig();

  log.info("Backup scheduler starting", {
    backupPath:    config.backupPath,
    retentionDays: config.retentionDays,
    schedules:     SCHEDULES.map(s => ({
      name:        s.name,
      intervalHrs: s.intervalMs / 3_600_000,
    })),
  });

  await printStatus(config.backupPath);

  // Run one tick immediately on startup, then check every minute
  await tick(config.backupPath);

  const timer = setInterval(() => {
    tick(config.backupPath).catch(e =>
      log.error("Scheduler tick failed", e instanceof Error ? e : undefined),
    );
  }, CHECK_INTERVAL_MS);

  // Keep process alive; allow clean shutdown on Ctrl-C / SIGTERM
  function shutdown(): void {
    log.info("Backup scheduler shutting down");
    clearInterval(timer);
    process.exit(0);
  }
  process.on("SIGINT",  shutdown);
  process.on("SIGTERM", shutdown);

  log.info(`Scheduler running — evaluating schedules every ${CHECK_INTERVAL_MS / 1_000}s`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
