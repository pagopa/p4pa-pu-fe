import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetOrganizationOperatorsQueryParams = Parameters<
  typeof utils.apiClient.bff.getOrganizationOperators
>[1];

type GetOrganizationsByBrokerIdQueryParams = Parameters<
  typeof utils.apiClient.bff.getOrganizationsByBrokerIdAndFilters
>[0];

export type OrganizationOperatorsFilters = Pick<
  NonNullable<GetOrganizationOperatorsQueryParams>,
  'firstName' | 'lastName' | 'fiscalCode'
>;

export type BrokerOrganizationsFilters = Pick<
  NonNullable<GetOrganizationsByBrokerIdQueryParams>,
  'orgName' | 'ipaCode'
>;

export type OrganizationOperatorsFilteredRequest =
  FilteredRequest<OrganizationOperatorsFilters>;
export type BrokerOrganizationsFilteredRequest =
  FilteredRequest<BrokerOrganizationsFilters>;

export const buildOrganizationOperatorsQueryParams = ({
  filters,
  pagination,
  sort
}: OrganizationOperatorsFilteredRequest): GetOrganizationOperatorsQueryParams => ({
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
}: BrokerOrganizationsFilteredRequest): GetOrganizationsByBrokerIdQueryParams => ({
  page: pagination.page,
  size: pagination.size,
  orgName: filters.orgName,
  ipaCode: filters.ipaCode,
  sort
});
