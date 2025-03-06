import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getReceipts = (
  organizationId: number,
  query: {
    receiptOrigin: 'RECEIPT_PAGOPA' | 'RECEIPT_FILE' | 'PAYMENTS_REPORTING';
    page?: number;
    size?: number;
    sort?: string[];
  },
  options = {}
) => {
  return useQuery({
    queryKey: ['receipts', query],
    queryFn: async () => {
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
    },
    retry: false,
    ...options
  });
};
