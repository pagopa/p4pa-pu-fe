import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetIngestionFlowFilesQuery = Parameters<
  typeof utils.apiClient.bff.getIngestionFlowFiles
>[1];

export type FlowFilesFilters = Pick<
  NonNullable<GetIngestionFlowFilesQuery>,
  'ingestionFlowFileTypes' | 'status' | 'fileName'
> & {
  dateRange?: {
    from: Date;
    to: Date;
  };
};

export type FlowFileFilteredRequest = FilteredRequest<FlowFilesFilters>;

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: FlowFileFilteredRequest): GetIngestionFlowFilesQuery => ({
  ingestionFlowFileTypes: filters.ingestionFlowFileTypes,
  creationDateTimeFrom: utils.formatters.date.code(filters?.dateRange?.from),
  creationDateTimeTo: utils.formatters.date.code(filters?.dateRange?.to),
  status: filters.status,
  fileName: filters.fileName,
  page: pagination.page,
  size: pagination.size,
  sort
});
