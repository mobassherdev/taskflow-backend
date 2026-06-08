export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, parseInt(query.page ?? '1'));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '10')));
  const skip = (page - 1) * limit;
  const orderBy = query.sortBy
    ? { [query.sortBy]: query.sortOrder ?? 'desc' }
    : { createdAt: 'desc' as const };
  return { page, limit, skip, orderBy };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}
