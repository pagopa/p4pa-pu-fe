import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedPaymentsReportingViewSchema } from '../../../generated/core/zod-schema';
import type { ReportingFilteredRequest } from './mappings';
import { buildQueryParams } from './mappings';

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
