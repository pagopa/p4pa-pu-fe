import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetOrganizationsByBrokerIdQueryParams = Parameters<
  typeof utils.apiClient.bff.getOrganizationsByBrokerIdAndFilters
>[0];

export type OrganizationsFilters = Pick<
  NonNullable<GetOrganizationsByBrokerIdQueryParams>,
  'orgName' | 'ipaCode'
>;

export type OrganizationsFilteredRequest =
  FilteredRequest<OrganizationsFilters>;

export const buildOrganizationsQueryParams = ({
  filters,
  pagination,
  sort
}: OrganizationsFilteredRequest): GetOrganizationsByBrokerIdQueryParams => ({
  page: pagination.page,
  size: pagination.size,
  orgName: filters.orgName,
  ipaCode: filters.ipaCode,
  sort
});
