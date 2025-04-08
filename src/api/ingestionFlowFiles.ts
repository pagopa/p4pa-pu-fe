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
