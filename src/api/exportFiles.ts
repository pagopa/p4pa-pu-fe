import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';
import { parseAndLog } from '../utils/loaders';
import { pagedExportFileSchema } from '../../generated/zod-schema';
import { extractFilename } from '../utils/formatters';

export const getExportFiles = (
  organizationId: number,
  query: {
    exportFileType: ExportFileTypeEnum;
    creationDateFrom?: string;
    creationDateTo?: string;
    status?: ExportFileStatus;
    fileName?: string;
    page?: number;
    size?: number;
    sort?: Array<string>;
  },
  options = {}
) => {
  return useQuery({
    queryKey: ['exportFiles', organizationId, query],
    queryFn: async () => {
      const { data: files } = await utils.apiClient.bff.getExportFiles(
        organizationId,
        query,
        {
          // Per serializzare correttamente i parametri
          paramsSerializer: {
            indexes: null
          }
        }
      );

      if (files) {
        parseAndLog(pagedExportFileSchema, files);
      }
      return files;
    },
    retry: false,
    enabled: !!organizationId,
    ...options
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
