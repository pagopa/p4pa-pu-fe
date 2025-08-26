import { FlowFileFilters } from '../../models/Filters';

export type FlowFileFilteredRequest = {
  filters: FlowFileFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: FlowFileFilteredRequest) => ({
  ...(filters.creationDateFrom && {
    creationDateFrom: filters.creationDateFrom
  }),
  ...(filters.creationDateTo && {
    creationDateTo: filters.creationDateTo
  }),
  ...(filters.ingestionFlowFileTypes && {
    ingestionFlowFileTypes: filters.ingestionFlowFileTypes
  }),
  ...(filters.status && { status: filters.status }),
  ...(filters.fileName && { fileName: filters.fileName }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
