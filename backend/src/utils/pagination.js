/**
 * @param {number} page - 1-based page
 * @param {number} limit - page size
 * @param {number} total - total matching documents
 */
export const buildPagination = (page, limit, total) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};
