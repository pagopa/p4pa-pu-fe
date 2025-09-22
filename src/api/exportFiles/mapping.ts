import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetExportFilesQueryParams = Parameters<
  typeof utils.apiClient.bff.getExportFiles
>[1];

export type ExportFilesFilters = Pick<
  NonNullable<GetExportFilesQueryParams>,
  'exportFileType' | 'status' | 'fileName'
> & {
  creationDateFrom?: Date;
  creationDateTo?: Date;
};

export type ExportFilesFilteredRequest = FilteredRequest<ExportFilesFilters>;

export const buildGetExportFilesQueryParams = ({
  filters,
  pagination,
  sort
}: ExportFilesFilteredRequest): GetExportFilesQueryParams => ({
  exportFileType: filters.exportFileType,
  creationDateTimeFrom: filters.creationDateFrom
    ? utils.formatters.date.code(filters.creationDateFrom)
    : undefined,
  creationDateTimeTo: filters.creationDateTo
    ? utils.formatters.date.code(filters.creationDateTo)
    : undefined,
  status: filters.status,
  fileName: filters.fileName,
  page: pagination.page,
  size: pagination.size,
  ...(sort?.length && { sort })
});
