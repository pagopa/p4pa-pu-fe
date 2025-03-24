import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { RequestParams } from '../../generated/fileshare/fileshareClient';
import { GetIngestionFlowFilesParamsFlowFileTypesEnum, GetIngestionFlowFilesParamsStatusEnum } from '../../generated/apiClient';

export enum FileOrigin {
  PORTAL = 'PORTAL',
  SIL = 'SIL',
  PAGOPA = 'PAGOPA'
}

export enum IngestionFlowFileType {
  RECEIPT = 'RECEIPT',
  RECEIPT_PAGOPA = 'RECEIPT_PAGOPA',
  PAYMENTS_REPORTING = 'PAYMENTS_REPORTING',
  PAYMENTS_REPORTING_PAGOPA = 'PAYMENTS_REPORTING_PAGOPA',
  TREASURY_OPI = 'TREASURY_OPI',
  TREASURY_CSV = 'TREASURY_CSV',
  TREASURY_XLS = 'TREASURY_XLS',
  TREASURY_POSTE = 'TREASURY_POSTE',
  DP_INSTALLMENTS = 'DP_INSTALLMENTS'
}

export const getIngestionFlowFiles = (
  organizationId: number,
  query: {
    flowFileTypes: Array<GetIngestionFlowFilesParamsFlowFileTypesEnum>;
    creationDateFrom?: string;
    creationDateTo?: string;
    status?: GetIngestionFlowFilesParamsStatusEnum;
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
