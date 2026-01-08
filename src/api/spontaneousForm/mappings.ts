export type SpontaneousFormsFilters = {
  code?: string;
};

export type SpontaneousFormsFilteredRequest = {
  filters: SpontaneousFormsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: SpontaneousFormsFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,

  ...(filters?.code && { code: filters.code }),

  ...(sort.length && { sort })
});
