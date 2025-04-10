import { useQuery } from '@tanstack/react-query';
import utils from '../utils';

export const getReceiptDetail = (
  organizationId: number,
  receiptId: number,
  options = {}
) => {
  return useQuery({
    queryKey: ['receiptDetail', organizationId, receiptId],
    queryFn: async () => {
      const { data: receiptdetail } =
        await utils.apiClient.bff.getReceiptDetail(organizationId, receiptId);
      return receiptdetail;
    },
    retry: false,
    ...options
  });
};
