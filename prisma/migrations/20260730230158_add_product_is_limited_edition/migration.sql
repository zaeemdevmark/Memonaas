-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isLimitedEdition" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "site_settings" ALTER COLUMN "storePhone" SET DEFAULT '+92 304 6665494';
