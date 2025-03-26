import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedPaymentsReportingRowSchema } from '../../generated/zod-schema';

type PaymentsReportingRowsParams = Parameters<
  typeof utils.apiClient.bff.getPaymentsReportingRows
>;
export type PaymentsReportingRowsQuery = PaymentsReportingRowsParams[2];

export const getPaymentsReportingRows = (
  organizationId: number,
  iuf: string,
  query: PaymentsReportingRowsQuery,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['getPaymentsReportingRows', organizationId, iuf, query],
    queryFn: async () => {
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
    },
    enabled: options?.enabled !== false && !!organizationId && !!iuf
  });
};
