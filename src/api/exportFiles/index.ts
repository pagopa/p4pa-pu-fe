import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedExportFileSchema } from '../../../generated/core/zod-schema';
import {
  buildGetExportFilesQueryParams,
  ExportFilesFilteredRequest
} from './mapping';

export const getExportFiles = (
  organizationId: number,
  routingCategory: string
) => {
  return useMutation({
    mutationKey: ['exportFiles', organizationId, routingCategory],
    mutationFn: async (args: ExportFilesFilteredRequest) => {
      const query = buildGetExportFilesQueryParams(args);
      const { data: files } = await utils.apiClient.bff.getExportFiles(
        organizationId,
        query
      );
      parseAndLog(pagedExportFileSchema, files);
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
        utils.formatters.extractFilename(contentDisposition) ||
        `file-${exportFileId}`;
      return { data: response.data, fileName };
    }
  });
