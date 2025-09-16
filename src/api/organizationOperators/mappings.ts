export type OrganizationOperatorsFilters = {
  firstName?: string;
  lastName?: string;
  fiscalCode?: string;
};

export type OrganizationOperatorsFilteredRequest = {
  filters: OrganizationOperatorsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export type BrokerOrganizationsFilters = {
  orgName?: string;
  ipaCode?: string;
};

export type BrokerOrganizationsFilteredRequest = {
  filters: BrokerOrganizationsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildOrganizationOperatorsQueryParams = ({
  filters,
  pagination,
  sort
}: OrganizationOperatorsFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  firstName: filters.firstName,
  lastName: filters.lastName,
  fiscalCode: filters.fiscalCode,
  sort
});

export const buildBrokerOrganizationsQueryParams = ({
  filters,
  pagination,
  sort
}: BrokerOrganizationsFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  orgName: filters.orgName,
  ipaCode: filters.ipaCode,
  sort
});