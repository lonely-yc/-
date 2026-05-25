export type PaginationResult<T> = {
  pageItems: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  start: number;
  end: number;
};

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * safePageSize;
  const pageItems = items.slice(startIndex, startIndex + safePageSize);

  return {
    pageItems,
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    start: total === 0 ? 0 : startIndex + 1,
    end: startIndex + pageItems.length,
  };
}
