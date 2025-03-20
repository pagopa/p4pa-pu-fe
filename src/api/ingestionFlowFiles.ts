import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedIngestionFlowFileSchema } from '../../generated/zod-schema';
import { FlowStatus } from '../models/Filters';
import { RequestParams } from '../../generated/fileshare/fileshareClient';

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
    flowFileTypes: Array<
      | 'RECEIPT'
      | 'RECEIPT_PAGOPA'
      | 'PAYMENTS_REPORTING'
      | 'PAYMENTS_REPORTING_PAGOPA'
      | 'TREASURY_OPI'
      | 'TREASURY_CSV'
      | 'TREASURY_XLS'
      | 'TREASURY_POSTE'
      | 'DP_INSTALLMENTS'
    >;
    creationDateFrom?: string;
    creationDateTo?: string;
    status?: FlowStatus;
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

      if (files?.content) {
        parseAndLog(pagedIngestionFlowFileSchema, files);
      }
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
