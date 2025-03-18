import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { transferDTOSchema } from '../../generated/zod-schema';

export const getTransfers = (organizationId: number, installmentId: number) => {
  return useQuery({
    queryKey: ['transfersQuery', organizationId, installmentId],
    queryFn: async () => {
      const { data: transfers } = await utils.apiClient.bff.getTransfers(
        organizationId,
        { installmentId }
      );
      if (transfers) {
        transfers.forEach((transfer) =>
          parseAndLog(transferDTOSchema, transfer)
        );
      }
      return transfers;
    },
    enabled: !!organizationId && !!installmentId
  });
};
