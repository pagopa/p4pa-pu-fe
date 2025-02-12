import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { ingestionFlowFileSchema } from '../../generated/zod-schema';
import { z } from 'zod';

export const getIngestionFlowFiles = (
  organizationId: number,
  query: {
    flowFileTypes: (
      | 'RECEIPT'
      | 'RECEIPT_PAGOPA'
      | 'PAYMENTS_REPORTING'
      | 'PAYMENTS_REPORTING_PAGOPA'
      | 'TREASURY_OPI'
      | 'TREASURY_CSV'
      | 'TREASURY_XLS'
      | 'TREASURY_POSTE'
    )[];
    creationDateFrom?: string;
    creationDateTo?: string;
    status?: string;
    fileName?: string;
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
            serialize: (params) => {
              const searchParams = new URLSearchParams();
              Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                  value.forEach(val => searchParams.append(key, val));
                } else if (value !== undefined) {
                  searchParams.append(key, value);
                }
              });
              return searchParams.toString();
            }
          }
        }
      );

      // ISO date conversion without offset for Zod validation. Need to investigate how to add the { offset: true } flag to the generated schema.
      if (files?.content) {
        const transformedFiles = {
          ...files,
          content: files.content.map((file) => ({
            ...file,
            creationDate: new Date(file.creationDate).toISOString()
          }))
        };

        parseAndLog(z.object({ content: z.array(ingestionFlowFileSchema) }), transformedFiles);

        return transformedFiles;
      }
      return files;
    },
    retry: false,
    ...options
  });
};
