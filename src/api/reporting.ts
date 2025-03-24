import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedPaymentsReportingRowSchema } from '../../generated/zod-schema';

type PaymentsReportingRowsParams = Parameters<
  typeof utils.apiClient.bff.getPaymentsReportingRows
>;
export type PaymentsReportingRowsQuery = PaymentsReportingRowsParams[2];

export const getPaymentsReportingRows = (
  organizationId: number,
  iuf: string
) => {
  return useMutation({
    mutationKey: ['getPaymentsReportingRows', organizationId, iuf],
    mutationFn: async (query: PaymentsReportingRowsQuery) => {
      const { data: paymentsReportingRows } =
        await utils.apiClient.bff.getPaymentsReportingRows(
          organizationId,
          iuf,
          query,
          {
            paramsSerializer: {
              indexes: null
            }
          }
        );
      if (paymentsReportingRows) {
        parseAndLog(pagedPaymentsReportingRowSchema, paymentsReportingRows);
      }
      return paymentsReportingRows;
    }
  });
};
