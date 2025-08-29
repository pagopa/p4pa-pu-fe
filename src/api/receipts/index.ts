import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { buildQueryParams, TelematicReceiptsFilteredRequest } from './mappings';
import { parseAndLog } from '../../utils/loaders';
import { pagedReceiptViewSchema } from '../../../generated/zod-schema';

export const getReceipts = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getReceipts', organizationId],
    mutationFn: async (args: TelematicReceiptsFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data } = await utils.apiClient.bff.getReceipts(
        organizationId,
        query
      );
      parseAndLog(pagedReceiptViewSchema, data)
      return data;
    }
  });
