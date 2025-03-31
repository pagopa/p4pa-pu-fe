import { useMutation } from '@tanstack/react-query';
import utils from '../utils';

type TelematicReceiptsParams = Parameters<
  typeof utils.apiClient.bff.getReceipts
>;
export type TelematicReceiptsQuery = TelematicReceiptsParams[1];

export const getReceipts = (organizationId: number) => {
  return useMutation({
    // queryKey: ['receipts', query],
    mutationKey: ['getReceipts', organizationId],
    mutationFn: async (query: TelematicReceiptsQuery) => {
      const { data: receipts } = await utils.apiClient.bff.getReceipts(
        organizationId,
        query,
        {
          paramsSerializer: {
            // repeat array params as query string
            indexes: null
          }
        }
      );
      return receipts;
    }
  });
};
