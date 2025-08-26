export type DebtPositionTypeWithCountFilters = {
  description?: string;
};

export type DebtPositionTypeWithCountFilteredRequest = {
  filters: DebtPositionTypeWithCountFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionTypeWithCountFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  ...(filters?.description && {
    description: filters.description
  }),
  ...(sort.length && { sort })
});
