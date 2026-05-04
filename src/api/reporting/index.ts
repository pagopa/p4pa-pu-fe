import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedPaymentsReportingRowSchema } from '../../../generated/zod-schema';
import {
  buildQueryParams,
  PaymentReportingRowsFilteredRequest
} from './mappings';

export const getPaymentsReportingRows = (
  organizationId: number,
  iuf: string
) => {
  return useMutation({
    mutationKey: ['getPaymentsReportingRows', organizationId, iuf],
    mutationFn: async (args: PaymentReportingRowsFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: paymentsReportingRows } =
        await utils.apiClient.bff.getPaymentsReportingRows(
          organizationId,
          iuf,
          query
        );
      parseAndLog(pagedPaymentsReportingRowSchema, paymentsReportingRows);
      return paymentsReportingRows;
    }
  });
};
