import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getReceipts = (
  query: {
    organizationId: number;
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
        query,
        {
          // To serialize parameters
          paramsSerializer: {
            serialize: (params) => {
              const searchParams = new URLSearchParams();
              Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                  value.forEach((val) => searchParams.append(key, val));
                } else if (value !== undefined) {
                  searchParams.append(key, value);
                }
              });
              return searchParams.toString();
            }
          }
        }
      );
      return receipts;
    },
    retry: false,
    ...options
  });
};
