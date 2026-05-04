import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetExportFilesQueryParams = Parameters<
  typeof utils.apiClient.bff.getExportFiles
>[1];

export type ExportFilesFilters = Pick<
  NonNullable<GetExportFilesQueryParams>,
  'exportFileType' | 'status' | 'fileName'
> & {
  dateRange?: {
    from: Date;
    to: Date;
  };
};

export type ExportFilesFilteredRequest = FilteredRequest<ExportFilesFilters>;

export const buildGetExportFilesQueryParams = ({
  filters,
  pagination,
  sort
}: ExportFilesFilteredRequest): GetExportFilesQueryParams => ({
  exportFileType: filters.exportFileType,
  creationDateTimeFrom: utils.formatters.date.code(filters?.dateRange?.from),
  creationDateTimeTo: utils.formatters.date.code(filters?.dateRange?.to),
  status: filters.status,
  fileName: filters.fileName,
  page: pagination.page,
  size: pagination.size,
  ...(sort?.length && { sort })
});
