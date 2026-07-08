-- ─────────────────────────────────────────────────────────────────
-- Full schema sync: brings the Neon DB in line with schema.prisma
-- Safe to run on an empty database (all tables were empty at time
-- of authoring — no data-loss risk).
-- ─────────────────────────────────────────────────────────────────

-- CreateEnum
CREATE TYPE "BrandAssetType" AS ENUM ('Logo', 'Favicon', 'Banner');

-- ─── 1. Create customers table ───────────────────────────────────

CREATE TABLE "customers" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "phone"     TEXT,
    "userId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customers_email_key"  ON "customers"("email");
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");
CREATE INDEX        "customers_email_idx"  ON "customers"("email");
CREATE INDEX        "customers_name_idx"   ON "customers"("name");
CREATE INDEX        "customers_phone_idx"  ON "customers"("phone");

ALTER TABLE "customers"
    ADD CONSTRAINT "customers_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 2. Rebuild addresses: userId → customerId ───────────────────

ALTER TABLE "addresses" DROP CONSTRAINT IF EXISTS "addresses_userId_fkey";
DROP INDEX IF EXISTS "addresses_userId_idx";
ALTER TABLE "addresses" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "addresses" ADD COLUMN "customerId" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "addresses" ALTER COLUMN "customerId" DROP DEFAULT;

CREATE INDEX "addresses_customerId_idx" ON "addresses"("customerId");

ALTER TABLE "addresses"
    ADD CONSTRAINT "addresses_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 3. Rebuild carts: userId → customerId ───────────────────────

ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "carts_userId_fkey";
DROP INDEX IF EXISTS "carts_userId_key";
ALTER TABLE "carts" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "carts" ADD COLUMN "customerId" TEXT;

CREATE UNIQUE INDEX "carts_customerId_key" ON "carts"("customerId");

ALTER TABLE "carts"
    ADD CONSTRAINT "carts_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 4. Rebuild orders: userId → customerId + add shipEmail ──────

ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_userId_fkey";
DROP INDEX IF EXISTS "orders_userId_idx";
DROP INDEX IF EXISTS "orders_userId_status_idx";
DROP INDEX IF EXISTS "orders_userId_createdAt_idx";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "orders" ADD COLUMN "customerId" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipEmail"  TEXT NOT NULL DEFAULT '';

CREATE INDEX "orders_customerId_idx"          ON "orders"("customerId");
CREATE INDEX "orders_customerId_status_idx"   ON "orders"("customerId", "status");
CREATE INDEX "orders_customerId_createdAt_idx" ON "orders"("customerId", "createdAt" DESC);

ALTER TABLE "orders"
    ADD CONSTRAINT "orders_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 5. Rebuild reviews: userId → customerId ─────────────────────

ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_userId_fkey";
DROP INDEX IF EXISTS "reviews_userId_productId_key";
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "reviews" ADD COLUMN "customerId" TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE "reviews" ALTER COLUMN "customerId" DROP DEFAULT;

CREATE UNIQUE INDEX "reviews_customerId_productId_key" ON "reviews"("customerId", "productId");

ALTER TABLE "reviews"
    ADD CONSTRAINT "reviews_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 6. Add missing columns to categories ────────────────────────

ALTER TABLE "categories"
    ADD COLUMN IF NOT EXISTS "imagePublicId"     TEXT,
    ADD COLUMN IF NOT EXISTS "imageOptimizedUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "imageThumbnailUrl" TEXT;

-- ─── 7. Add missing columns to products ──────────────────────────

ALTER TABLE "products"
    ADD COLUMN IF NOT EXISTS "sizeGuideImage1Url"          TEXT,
    ADD COLUMN IF NOT EXISTS "sizeGuideImage1OptimizedUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "sizeGuideImage1PublicId"     TEXT,
    ADD COLUMN IF NOT EXISTS "sizeGuideImage2Url"          TEXT,
    ADD COLUMN IF NOT EXISTS "sizeGuideImage2OptimizedUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "sizeGuideImage2PublicId"     TEXT;

-- ─── 8. Add missing columns to product_images ────────────────────

ALTER TABLE "product_images"
    ADD COLUMN IF NOT EXISTS "optimizedUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "publicId"     TEXT;

-- ─── 9. Add missing index to product_variants ────────────────────

CREATE INDEX IF NOT EXISTS "product_variants_reservedStock_idx" ON "product_variants"("reservedStock");

-- ─── 10. Create order_status_history table ───────────────────────

CREATE TABLE "order_status_history" (
    "id"        TEXT         NOT NULL,
    "orderId"   TEXT         NOT NULL,
    "status"    "OrderStatus" NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");

ALTER TABLE "order_status_history"
    ADD CONSTRAINT "order_status_history_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── 11. Create brand_assets table ───────────────────────────────

CREATE TABLE "brand_assets" (
    "id"           TEXT            NOT NULL,
    "type"         "BrandAssetType" NOT NULL,
    "url"          TEXT            NOT NULL,
    "optimizedUrl" TEXT            NOT NULL,
    "thumbnailUrl" TEXT            NOT NULL,
    "publicId"     TEXT            NOT NULL,
    "createdAt"    TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "brand_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "brand_assets_type_key" ON "brand_assets"("type");
