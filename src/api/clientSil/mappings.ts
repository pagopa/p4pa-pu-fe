/**
 * Mapping and types for the API of Client SIL
 */

export type ClientSilFilters = {
  clientName?: string;
  clientId?: string;
};

export type ClientSilFilteredRequest = {
  filters: ClientSilFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ClientSilFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  ...(filters?.clientName && { clientName: filters.clientName }),
  ...(filters?.clientId && { clientId: filters.clientId }),
  ...(sort.length && { sort })
});
