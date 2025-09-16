export type OrganizationsFilters = {
  orgName?: string;
  ipaCode?: string;
};

export type OrganizationsFilteredRequest = {
  filters: OrganizationsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildOrganizationsQueryParams = ({
  filters,
  pagination,
  sort
}: OrganizationsFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  orgName: filters.orgName,
  ipaCode: filters.ipaCode,
  sort
});
