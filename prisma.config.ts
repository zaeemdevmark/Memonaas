import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  // Provides the connection URL for `prisma migrate` and `prisma db push`.
  // For the runtime PrismaClient, see lib/prisma.ts (uses @prisma/adapter-pg).
  datasource: {
    url: env("DATABASE_URL"),
  },
});
