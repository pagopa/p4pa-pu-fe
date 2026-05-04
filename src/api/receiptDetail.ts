import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getReceiptDetail = (
  organizationId: number,
  receiptId: number,
  params?: { iud?: string },
  options = {}
) => {
  return useQuery({
    queryKey: ['receiptDetail', organizationId, receiptId, params?.iud],
    queryFn: async () => {
      const { data: receiptdetail } =
        await utils.apiClient.bff.getReceiptDetail(
          organizationId,
          receiptId,
          params
        );
      return receiptdetail;
    },
    retry: false,
    ...options
  });
};
