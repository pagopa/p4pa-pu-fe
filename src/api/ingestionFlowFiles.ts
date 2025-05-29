import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import {
  FileOrigin,
  IngestionFlowFileType,
  RequestParams
} from '../../generated/fileshare/fileshareClient';
import {
  IngestionFlowFileStatus,
  IngestionFlowFileTypeEnum
} from '../../generated/apiClient';
import { extractFilename } from '../utils/formatters';

export const getIngestionFlowFiles = (
  organizationId: number,
  query: {
    ingestionFlowFileTypes: Array<IngestionFlowFileTypeEnum>;
    creationDateFrom?: string;
    creationDateTo?: string;
    status?: IngestionFlowFileStatus;
    fileName?: string;
    page?: number;
    size?: number;
    sort?: Array<string>;
  },
  options = {}
) => {
  return useQuery({
    queryKey: ['ingestionFlowFiles', organizationId, query],
    queryFn: async () => {
      const { data: files } = await utils.apiClient.bff.getIngestionFlowFiles(
        organizationId,
        query,
        {
          // To serialize flowFileTypes parameters
          paramsSerializer: {
            indexes: null
          }
        }
      );

      return files;
    },
    retry: false,
    enabled: !!organizationId,
    ...options
  });
};

export const uploadIngestionFlowFile = ({
  organizationId,
  ingestionFlowFileType
}: {
  organizationId: number;
  ingestionFlowFileType: IngestionFlowFileType;
}) =>
  useMutation({
    mutationKey: ['uploadIngestionFlowFiles', organizationId],
    mutationFn: async (file: File, params?: RequestParams) => {
      const { data: response } =
        await utils.fileshareClient.organization.uploadIngestionFlowFile(
          organizationId,
          {
            ingestionFlowFileType,
            fileOrigin: FileOrigin.PORTAL,
            fileName: file.name
          },
          {
            ingestionFlowFile: file
          },
          params
        );

      return response;
    }
  });

/** returns a mutation to get the ingestion flow blob file */
export const getIngestionFlowFile = (organizationId: number) =>
  useMutation({
    mutationKey: ['getIngestionFlowFile', organizationId],
    mutationFn: async (ingestionFlowFileId: number) => {
      const response =
        await utils.fileshareClient.organization.downloadIngestionFlowFile(
          organizationId,
          ingestionFlowFileId,
          { format: 'blob' }
        );
      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) || `file-${ingestionFlowFileId}`;

      return { data: response.data, fileName };
    }
  });

/** returns a mutation to get the ingestion flow error blob file */
export const getIngestionFlowFileError = (organizationId: number) =>
  useMutation({
    mutationKey: ['downloadIngestionFlowFileError', organizationId],
    mutationFn: async (ingestionFlowFileId: number) => {
      const response =
        await utils.fileshareClient.organization.downloadIngestionFlowErrorsFile(
          organizationId,
          ingestionFlowFileId,
          { format: 'blob' }
        );

      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) || `file-${ingestionFlowFileId}`;

      return { data: response.data, fileName };
    }
  });
