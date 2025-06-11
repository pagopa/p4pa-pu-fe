import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { extractFilename } from '../utils/formatters';

/** returns a mutation to get the receipt pdf blob file */
export const getReceiptPdf = (organizationId: number) => {
  return useMutation({
    mutationKey: ['getReceipts', organizationId],
    mutationFn: async (receiptId: number) => {
      const response = await utils.apiClient.bff.getReceiptPdf(
        organizationId,
        receiptId,
        { format: 'blob' }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) || `file-${receiptId}`;

      return { data: response.data, fileName };
    }
  });
};
