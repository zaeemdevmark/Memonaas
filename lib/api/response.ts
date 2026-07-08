import { logger } from "@/lib/logger";

export interface Pagination {
  page:        number;
  limit:       number;
  total:       number;
  totalPages:  number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function paginated<T>(data: T[], pagination: Pagination): Response {
  return Response.json({ success: true, data, pagination });
}

export function err(message: string, status = 500): Response {
  if (status >= 500) {
    logger.error(`API ${status}`, undefined, { message, status });
  }
  return Response.json({ success: false, error: message }, { status });
}

export function buildPagination(
  page: number,
  limit: number,
  total: number,
): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
