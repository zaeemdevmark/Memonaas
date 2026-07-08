import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export { checkDatabaseHealth }       from "./health";
export type { HealthCheckResult }    from "./health";
export {
  DatabaseError,
  UniqueConstraintError,
  RecordNotFoundError,
  ForeignKeyConstraintError,
  NullConstraintError,
  handlePrismaError,
  isNotFoundError,
  isUniqueError,
}                                    from "./errors";
export { default as prisma }         from "../prisma";

/**
 * Runs `fn` inside a Prisma interactive transaction.
 *
 * Usage:
 *   const order = await withTransaction(async (tx) => {
 *     const o = await tx.order.create({ data: orderData });
 *     await tx.orderItem.createMany({ data: items.map(i => ({ ...i, orderId: o.id })) });
 *     return o;
 *   });
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?:            number;  // ms to wait for a connection  (default 2 000)
    timeout?:            number;  // ms before the transaction is rolled back (default 5 000)
    isolationLevel?:     Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait:         options?.maxWait         ?? 2_000,
    timeout:         options?.timeout         ?? 5_000,
    isolationLevel:  options?.isolationLevel,
  });
}
