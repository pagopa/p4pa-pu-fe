import { OrgSilServiceType } from '../../../generated/core/data-contracts';

export type OrgSilServicesFilters = {
  applicationName?: string;
  serviceType?: OrgSilServiceType;
  flagLegacy?: boolean;
};

export type OrgSilServicesFilteredRequest = {
  filters: OrgSilServicesFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: OrgSilServicesFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,

  ...(filters?.applicationName && { applicationName: filters.applicationName }),
  ...(filters?.serviceType && { serviceType: filters.serviceType }),
  ...(filters?.flagLegacy !== undefined && { flagLegacy: filters.flagLegacy }),

  ...(sort.length && { sort })
});
