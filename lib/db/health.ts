import prisma from "../prisma";

export interface HealthCheckResult {
  healthy:    boolean;
  latencyMs?: number;
  error?:     string;
}

/**
 * Runs a lightweight `SELECT 1` against the database and measures latency.
 * Intended for health-check endpoints, startup probes, and monitoring.
 *
 * Safe to call without await — returns { healthy: false } on any error
 * rather than throwing.
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
