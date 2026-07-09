import "dotenv/config";
import prisma from "../lib/prisma";
import { Size } from "@prisma/client";

const CATEGORIES = [
  { name: "3-Piece Suits", slug: "3-piece-suits", description: "Embroidered lawn and cambric sets — shirt, trouser, and dupatta." },
  { name: "Festive Wear", slug: "festive-wear", description: "Statement pieces for weddings and celebrations." },
  { name: "Accessories", slug: "accessories", description: "Jewelry and finishing pieces." },
];

const PRODUCTS = [
  {
    name: "Ivory Garden Embroidered Suit",
    price: 7500,
    imageCount: 8,
    color: { name: "Ivory", hex: "#EFE8D3" },
  },
  {
    name: "Rose Butterfly Embroidered Suit",
    price: 6900,
    imageCount: 6,
    color: { name: "Rose Pink", hex: "#E6A9C0" },
  },
  {
    name: "Mauve Mosaic Embroidered Suit",
    price: 8200,
    imageCount: 7,
    color: { name: "Mauve", hex: "#D8A8C0" },
  },
  {
    name: "Golden Bloom Embroidered Suit",
    price: 7900,
    imageCount: 7,
    color: { name: "Butter Gold", hex: "#EBDFAF" },
  },
  {
    name: "Ivory Crimson Embroidered Suit",
    price: 7200,
    imageCount: 6,
    color: { name: "Ivory Red", hex: "#F1E6D2" },
  },
  {
    name: "Powder Blue Embroidered Suit",
    price: 8500,
    imageCount: 6,
    color: { name: "Powder Blue", hex: "#C7D9E8" },
  },
  {
    name: "Azure Ombre Embroidered Suit",
    price: 8900,
    imageCount: 6,
    color: { name: "Azure", hex: "#4E9BCB" },
  },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const categoryMap = new Map<string, string>();

  for (const [i, cat] of CATEGORIES.entries()) {
    const created = await prisma.category.create({
      data: { ...cat, sortOrder: i, isActive: true },
    });
    categoryMap.set(cat.slug, created.id);
  }

  const suitsCategoryId = categoryMap.get("3-piece-suits")!;

  for (const [i, p] of PRODUCTS.entries()) {
    const slug = slugify(p.name);
    const sku = `MEM-P${i + 1}`;

    const images = Array.from({ length: p.imageCount }, (_, j) => {
      const n = String(j + 1).padStart(2, "0");
      const url = `/images/products/p${i + 1}-${n}.jpg`;
      return {
        url,
        optimizedUrl: url,
        thumbnailUrl: url,
        altText: p.name,
        position: j,
        isDefault: j === 0,
      };
    });

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        sku,
        description: `${p.name} — a hand-embroidered 3-piece suit (shirt, trouser, and dupatta) from the Memonaas collection.`,
        basePrice: p.price,
        status: "Active",
        isFeatured: i < 4,
        sortOrder: i,
        categoryId: suitsCategoryId,
        images: { create: images },
      },
    });

    const sizes: Size[] = ["S", "M", "L", "XL"];
    for (const size of sizes) {
      const variantSku = `${sku}-${size}`;
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantSku,
          size,
          color: p.color.name,
          colorHex: p.color.hex,
          stock: 15,
          price: p.price,
        },
      });
    }
  }

  console.log(`Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
