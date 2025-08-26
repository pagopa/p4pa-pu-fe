import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedPaymentsReportingViewSchema } from '../../../generated/zod-schema';
import { buildQueryParams, ReportingFilteredRequest } from './mappings';

export const getPaymentsReporting = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getPaymentsReporting', organizationId],
    mutationFn: async (args: ReportingFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data } = await utils.apiClient.bff.getPaymentsReporting(
        organizationId,
        query
      );
      parseAndLog(pagedPaymentsReportingViewSchema, data);
      return data;
    }
  });
