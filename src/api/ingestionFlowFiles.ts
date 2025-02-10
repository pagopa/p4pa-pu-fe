import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { ingestionFlowFileSchema } from '../../generated/zod-schema';
import { z } from 'zod';

export const useIngestionFlowFiles = (
  organizationId: number,
  query: {
    flowFileType: string;
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
        query
      );

      console.log('API Response:', files);
      if (files) {
        parseAndLog(z.object({ content: z.array(ingestionFlowFileSchema) }), files);
      }

      return files;
    },
    ...options
  });
};
