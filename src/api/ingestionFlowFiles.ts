import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { ingestionFlowFileSchema } from '../../generated/zod-schema';
import { z } from 'zod';

export const getIngestionFlowFiles = (
  organizationId: number,
  query: {
    flowFileTypes: string[];
    creationDateFrom?: string;
    creationDateTo?: string;
    status?: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'EXPIRED' | 'ERROR';
    fileName?: string;
  },
  options = {}
) => {
  return useQuery({
    queryKey: ['ingestionFlowFiles', organizationId, query],
    queryFn: async () => {
      const { data: files } = await utils.apiClient.ingestionFlowFiles.getIngestionFlowFiles(
        organizationId,
        query,
        {
          // necessario per serializzare i parametri visto il cambio dell'OpenAPI in cui i flowFileTypes sono un'array (di stringhe perché il tipo non viene fornito)
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

      // La data per come è in input da problemi per la validazione serve necessariamente una ISO string
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
