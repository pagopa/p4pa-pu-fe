export type DebtPositionTypeOrgOperatorFilters = {
  debtPositionTypeOrgId?: number;
};

export type DebtPositionTypeOrgOperatorFilteredRequest = {
  filters: DebtPositionTypeOrgOperatorFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionTypeOrgOperatorFilteredRequest) => ({
  debtPositionTypeOrgId: filters.debtPositionTypeOrgId,
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
