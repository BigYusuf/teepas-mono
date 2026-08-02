interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export const getPagination = (
  query: any,
  options: PaginationOptions = {},
) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
  } = options;

  const page = Math.max(parseInt(query.page as string, 10) || 1, 1);

  const limit = Math.min(
    Math.max(parseInt(query.limit as string, 10) || defaultLimit, 1),
    maxLimit,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number,
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});