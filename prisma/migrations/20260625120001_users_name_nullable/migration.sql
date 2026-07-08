-- users.name was added NOT NULL in the init migration but the current
-- schema removed it from the User model (name lives on Customer now).
-- Prisma does not include this column in INSERTs, so it must be nullable.
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;
