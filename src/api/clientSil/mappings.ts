import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetClientsQueryParams = Parameters<
  typeof utils.apiClient.bff.getClients
>[1];

export type ClientSilFilters = Pick<
  NonNullable<GetClientsQueryParams>,
  'clientName' | 'clientId'
>;

export type ClientSilFilteredRequest = FilteredRequest<ClientSilFilters>;

export type ClientSilCreateRequest = {
  clientName: string;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ClientSilFilteredRequest): GetClientsQueryParams => ({
  page: pagination.page,
  size: pagination.size,
  ...(filters?.clientName && { clientName: filters.clientName }),
  ...(filters?.clientId && { clientId: filters.clientId }),
  ...(sort?.length && { sort })
});
