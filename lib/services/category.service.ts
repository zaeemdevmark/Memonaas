import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type {
  CategoryListItem,
  CategoryTreeNode,
  CategoryDetail,
} from "@/lib/types/category";
import type { CreateCategoryBody, UpdateCategoryBody } from "@/lib/validations/category";
import { slugify } from "@/lib/validations/category";
import { RecordNotFoundError } from "@/lib/db/errors";

// ── Shared Prisma fragments ────────────────────────────────────────────────

const ACTIVE_PRODUCTS_COUNT = {
  where: { status: "Active" } as Prisma.ProductWhereInput,
};

const ACTIVE_CHILDREN_COUNT = {
  where: { isActive: true } as Prisma.CategoryWhereInput,
};

// ── List include ───────────────────────────────────────────────────────────

const listInclude = {
  parent: { select: { id: true, name: true, slug: true } },
  _count: {
    select: {
      products: ACTIVE_PRODUCTS_COUNT,
      children: ACTIVE_CHILDREN_COUNT,
    },
  },
} satisfies Prisma.CategoryInclude;

type ListRow = Prisma.CategoryGetPayload<{ include: typeof listInclude }>;

function serializeListItem(c: ListRow): CategoryListItem {
  return {
    id:            c.id,
    name:          c.name,
    slug:          c.slug,
    description:   c.description,
    imageUrl:      c.imageUrl,
    sortOrder:     c.sortOrder,
    isActive:      c.isActive,
    parentId:      c.parentId,
    parent:        c.parent,
    productCount:  c._count.products,
    childrenCount: c._count.children,
    createdAt:     c.createdAt.toISOString(),
    updatedAt:     c.updatedAt.toISOString(),
  };
}

// ── Tree builder ───────────────────────────────────────────────────────────

function buildTree(items: CategoryListItem[]): CategoryTreeNode[] {
  const byId = new Map(items.map((c) => [c.id, c]));
  const childMap = new Map<string, CategoryListItem[]>();

  for (const c of items) {
    if (c.parentId) {
      const siblings = childMap.get(c.parentId) ?? [];
      siblings.push(c);
      childMap.set(c.parentId, siblings);
    }
  }

  function nest(cats: CategoryListItem[]): CategoryTreeNode[] {
    return cats.map((c) => ({
      ...c,
      children: nest(childMap.get(c.id) ?? []),
    }));
  }

  const roots = items.filter((c) => !c.parentId || !byId.has(c.parentId));
  return nest(roots);
}

// ── getCategories ──────────────────────────────────────────────────────────

export async function getCategories(
  tree: boolean,
  showAll = false,
): Promise<CategoryListItem[] | CategoryTreeNode[]> {
  const rows = await prisma.category.findMany({
    where:   showAll ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: listInclude,
  });

  const flat = rows.map(serializeListItem);
  return tree ? buildTree(flat) : flat;
}

// ── Detail include ─────────────────────────────────────────────────────────

const detailInclude = {
  parent: { select: { id: true, name: true, slug: true } },
  children: {
    where:   { isActive: true } as Prisma.CategoryWhereInput,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }] as Prisma.CategoryOrderByWithRelationInput[],
    include: {
      _count: { select: { products: ACTIVE_PRODUCTS_COUNT } },
    },
  },
  _count: {
    select: { products: ACTIVE_PRODUCTS_COUNT },
  },
} satisfies Prisma.CategoryInclude;

type DetailRow = Prisma.CategoryGetPayload<{ include: typeof detailInclude }>;

function serializeDetail(c: DetailRow): CategoryDetail {
  return {
    id:          c.id,
    name:        c.name,
    slug:        c.slug,
    description: c.description,
    imageUrl:    c.imageUrl,
    sortOrder:   c.sortOrder,
    parentId:    c.parentId,
    parent:      c.parent,
    children:    c.children.map((ch) => ({
      id:           ch.id,
      name:         ch.name,
      slug:         ch.slug,
      description:  ch.description,
      imageUrl:     ch.imageUrl,
      sortOrder:    ch.sortOrder,
      productCount: ch._count.products,
    })),
    productCount: c._count.products,
    createdAt:    c.createdAt.toISOString(),
    updatedAt:    c.updatedAt.toISOString(),
  };
}

// ── getCategoryBySlug ──────────────────────────────────────────────────────

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryDetail | null> {
  const category = await prisma.category.findUnique({
    where:   { slug },
    include: detailInclude,
  });

  if (!category || !category.isActive) return null;

  return serializeDetail(category);
}

// ── Slug helpers ───────────────────────────────────────────────────────────

async function uniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

// ── createCategory ─────────────────────────────────────────────────────────

export async function createCategory(
  body: CreateCategoryBody,
): Promise<CategoryListItem> {
  const slug = body.slug || await uniqueCategorySlug(body.name);

  const category = await prisma.category.create({
    data: {
      name:        body.name,
      slug,
      description: body.description,
      imageUrl:    body.imageUrl,
      parentId:    body.parentId,
      sortOrder:   body.sortOrder ?? 0,
      isActive:    body.isActive ?? true,
    },
    include: listInclude,
  });

  return serializeListItem(category);
}

// ── updateCategory ─────────────────────────────────────────────────────────

export async function updateCategory(
  slug: string,
  body: UpdateCategoryBody,
): Promise<CategoryListItem> {
  const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true, name: true } });
  if (!existing) throw new RecordNotFoundError("Category");

  const newSlug = body.name && body.name !== existing.name && !body.slug
    ? await uniqueCategorySlug(body.name, existing.id)
    : body.slug ?? undefined;

  const category = await prisma.category.update({
    where: { id: existing.id },
    data: {
      ...(body.name        !== undefined && { name:        body.name }),
      ...(newSlug          !== undefined && { slug:        newSlug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.imageUrl    !== undefined && { imageUrl:    body.imageUrl }),
      ...(body.parentId    !== undefined && { parentId:    body.parentId }),
      ...(body.sortOrder   !== undefined && { sortOrder:   body.sortOrder }),
      ...(body.isActive    !== undefined && { isActive:    body.isActive }),
    },
    include: listInclude,
  });

  return serializeListItem(category);
}

// ── deleteCategory ─────────────────────────────────────────────────────────

export async function deleteCategory(slug: string): Promise<void> {
  const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) throw new RecordNotFoundError("Category");
  await prisma.category.delete({ where: { id: existing.id } });
}

// ── reorderCategories ────────────────────────────────────────────────────────
//
// Reassigns the given subset's own existing sortOrder values (sorted) to the
// new sequence, rather than renumbering from 0 — see reorderProducts() in
// product.service.ts for why (keeps parent/child groupings from colliding).

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;

  const existing = await prisma.category.findMany({
    where:  { id: { in: orderedIds } },
    select: { sortOrder: true },
  });
  const slots = existing.map((c) => c.sortOrder).sort((a, b) => a - b);

  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.category.update({ where: { id }, data: { sortOrder: slots[i] } }),
    ),
    { timeout: 20_000 },
  );
}
