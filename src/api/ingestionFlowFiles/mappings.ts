import { FlowFileFilters } from '../../models/Filters';
import utils from '../../utils';

export type FlowFileFilteredRequest = {
  filters: FlowFileFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type getIngestionFlowFilesQuery = Parameters<
  typeof utils.apiClient.bff.getIngestionFlowFiles
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: FlowFileFilteredRequest): getIngestionFlowFilesQuery => ({
  ingestionFlowFileTypes: filters.ingestionFlowFileTypes,
  creationDateTimeFrom: utils.formatters.date.code(filters.creationDateFrom),
  creationDateTimeTo: utils.formatters.date.code(filters.creationDateTo),
  status: filters.status,
  fileName: filters.fileName,
  page: pagination.page,
  size: pagination.size,
  sort
});
