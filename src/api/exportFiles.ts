import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';
import { parseAndLog } from '../utils/loaders';
import { pagedExportFileSchema } from '../../generated/zod-schema';
import { extractFilename } from '../utils/formatters';

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

export const getExportFiles = (
  organizationId: number,
  routingCategory: string
) => {
  return useMutation({
    mutationKey: ['exportFiles', organizationId, routingCategory],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: ExportFilesFilteredRequest) => {
      const query = { ...filters, ...pagination, sort };
      const { data: files } = await utils.apiClient.bff.getExportFiles(
        organizationId,
        {
          ...query,
          creationDateTimeFrom: utils.formatters.date.code(
            query.creationDateFrom
          ),
          creationDateTimeTo: utils.formatters.date.code(query.creationDateTo)
        }
      );

      if (files) {
        parseAndLog(pagedExportFileSchema, files);
      }
      return files;
    },
    retry: false
  });
};

/** returns a mutation to get export blob file */
export const getExportFile = (organizationId: number) =>
  useMutation({
    mutationKey: ['getExportFile', organizationId],
    mutationFn: async (exportFileId: number) => {
      const response =
        await utils.fileshareClient.organization.downloadExportFile(
          organizationId,
          exportFileId,
          { format: 'blob' }
        );
      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) || `file-${exportFileId}`;
      return { data: response.data, fileName };
    }
  });
