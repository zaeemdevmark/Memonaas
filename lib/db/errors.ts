import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

// ── Base error ─────────────────────────────────────────────────────

export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DatabaseError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

// ── Specific error types ───────────────────────────────────────────

/** Thrown when a unique index or constraint is violated (Prisma P2002). */
export class UniqueConstraintError extends DatabaseError {
  constructor(public readonly fields: string[]) {
    super(
      `A record with this ${fields.join(", ")} already exists.`,
    );
    this.name = "UniqueConstraintError";
  }
}

/** Thrown when an update/delete targets a record that does not exist (Prisma P2025). */
export class RecordNotFoundError extends DatabaseError {
  constructor(resource = "Record") {
    super(`${resource} not found.`);
    this.name = "RecordNotFoundError";
  }
}

/** Thrown when an operation violates a foreign-key constraint (Prisma P2003). */
export class ForeignKeyConstraintError extends DatabaseError {
  constructor() {
    super("Operation failed: a related record does not exist or has been deleted.");
    this.name = "ForeignKeyConstraintError";
  }
}

/** Thrown when a required field is null (Prisma P2011). */
export class NullConstraintError extends DatabaseError {
  constructor(field: string) {
    super(`A required field is missing: ${field}.`);
    this.name = "NullConstraintError";
  }
}

// ── Central error handler ──────────────────────────────────────────
//
// Call this inside catch blocks in server actions / route handlers.
// It translates opaque Prisma error codes into readable application
// errors that callers can instanceof-check.
//
//   try {
//     await prisma.user.create({ data })
//   } catch (err) {
//     handlePrismaError(err)   // always throws
//   }

export function handlePrismaError(error: unknown): never {
  // Known request errors — Prisma client received a response but it
  // contained a well-defined error (unique violation, not found, etc.)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target as string[] : ["field"];
        throw new UniqueConstraintError(fields);
      }
      case "P2003":
        throw new ForeignKeyConstraintError();
      case "P2011":
        throw new NullConstraintError(String(error.meta?.constraint ?? "unknown"));
      case "P2025":
        throw new RecordNotFoundError();
      case "P2016":
        throw new DatabaseError("Query interpretation error. Check your filter parameters.");
      case "P2028":
        throw new DatabaseError("Transaction timed out or was rolled back. Please retry.");
      default:
        throw new DatabaseError(`Database error [${error.code}]: ${error.message}`, error);
    }
  }

  // Validation errors — Prisma rejected the query before sending it
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseError(
      "Invalid database query. This is likely a bug — please report it.",
      error,
    );
  }

  // Initialization errors — client could not connect
  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error("Database connection failed", error);
    throw new DatabaseError(
      "Could not connect to the database. Verify that DATABASE_URL is correct and the server is reachable.",
      error,
    );
  }

  // Re-throw our own errors unchanged so they propagate cleanly
  if (error instanceof DatabaseError) throw error;

  // Anything else — unexpected and worth reporting
  logger.error("Unexpected database error", error instanceof Error ? error : undefined);
  throw new DatabaseError("An unexpected database error occurred.", error);
}

// ── Type guard helpers ─────────────────────────────────────────────

export function isNotFoundError(error: unknown): error is RecordNotFoundError {
  return error instanceof RecordNotFoundError;
}

export function isUniqueError(error: unknown): error is UniqueConstraintError {
  return error instanceof UniqueConstraintError;
}
