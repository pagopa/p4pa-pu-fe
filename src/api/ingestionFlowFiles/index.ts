import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import {
  FileOrigin,
  IngestionFlowFileType,
  RequestParams
} from '../../../generated/fileshare/fileshareClient';
import { extractFilename } from '../../utils/formatters';
import { buildQueryParams } from './mappings';
import { FlowFileFilters } from '../../models/Filters';

export type FlowFileFilteredRequest = {
  filters: FlowFileFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const getIngestionFlowFiles = (
  organizationId: number,
  routingCategory: string
) => {
  return useMutation({
    mutationKey: ['getIngestionFlowFiles', organizationId, routingCategory],
    mutationFn: async (args: FlowFileFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: files } = await utils.apiClient.bff.getIngestionFlowFiles(
        organizationId,
        query
      );
      return files;
    }
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
