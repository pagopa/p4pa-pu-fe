import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { paymentsReportingDetailDTOSchema } from '../../generated/zod-schema';

type PaymentsReportingParams = Parameters<
  typeof utils.apiClient.bff.getPaymentsReporting
>;
export type PaymentsReportingQuery = PaymentsReportingParams[1];

export const getPaymentsReportingDetail = (
  organizationId: number,
  iuf: string,
  paymentsReportingId: string,
  options: Record<string, unknown> = {}
) => {
  return useQuery({
    queryKey: [
      'getPaymentsReportingDetail',
      organizationId,
      iuf,
      paymentsReportingId
    ],
    queryFn: async () => {
      const { data: paymentsReporting } =
        await utils.apiClient.bff.getPaymentsReportingDetail(
          organizationId,
          iuf,
          paymentsReportingId
        );
      if (paymentsReporting) {
        parseAndLog(paymentsReportingDetailDTOSchema, paymentsReporting);
      }
      return paymentsReporting;
    },
    ...options
  });
};
