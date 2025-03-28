import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedPaymentsReportingViewSchema } from '../../generated/zod-schema';

type PaymentsReportingParams = Parameters<
  typeof utils.apiClient.bff.getPaymentsReporting
>;
export type PaymentsReportingQuery = PaymentsReportingParams[1];

export const getPaymentsReporting = (organizationId: number) => {
  return useMutation({
    // queryKey: ['receipts', query],
    mutationKey: ['getPaymentsReporting', organizationId],
    mutationFn: async (query: PaymentsReportingQuery) => {
      const { data: paymentsReporting } =
        await utils.apiClient.bff.getPaymentsReporting(organizationId, query, {
          paramsSerializer: {
            // repeat array params as query string
            indexes: null
          }
        });
      if (paymentsReporting) {
        parseAndLog(pagedPaymentsReportingViewSchema, paymentsReporting);
      }
      return paymentsReporting;
    }
  });
};
