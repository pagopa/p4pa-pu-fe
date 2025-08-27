import { ExportFileStatus, ExportFileTypeEnum } from "../../../generated/data-contracts";
import utils from "../../utils";

export type DebtPositionTypeOrgOperatorFilters = {
  debtPositionTypeOrgId?: number;
};

export type ExportQuery = {
  exportFileType: ExportFileTypeEnum;
  creationDateFrom?: Date;
  creationDateTo?: Date;
  status?: ExportFileStatus;
  fileName?: string;
};

export type ExportFilesFilteredRequest = {
  filters: ExportQuery;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type GetExportFilesQuery = Parameters<
  typeof utils.apiClient.bff.getExportFiles
>[1];

export const buildGetExportFilesQueryParams = ({
  filters,
  pagination,
  sort
}: ExportFilesFilteredRequest): GetExportFilesQuery => ({
  exportFileType: filters.exportFileType,
  creationDateTimeFrom: utils.formatters.date.code(filters.creationDateFrom),
  creationDateTimeTo: utils.formatters.date.code(filters.creationDateTo),
  status: filters.status as ExportFileStatus,
  fileName: filters.fileName,
  page: pagination.page,
  size: pagination.size,
  sort
});
