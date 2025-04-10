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

export const downloadIngestionFlowFile = async (
  organizationId: number,
  ingestionFlowFileId: number
) => {
  const response =
    await utils.fileshareClient.organization.downloadIngestionFlowFile(
      organizationId,
      ingestionFlowFileId
    );

  // Create a blob URL for the file
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);

  // Try to get filename from response headers or use a default
  const contentDisposition = response.headers['content-disposition'];
  const fileName = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
    : `downloaded-file-${ingestionFlowFileId}`;

  // Create an invisible link element and simulate a click to start the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  link.click();

  // Cleanup
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
};
