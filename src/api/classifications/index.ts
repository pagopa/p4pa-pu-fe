import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedTreasuredClassificationExtendedDTOSchema } from '../../../generated/core/zod-schema';
import type { ClassificationsFilteredRequest } from './mappings';
import { buildQueryParams } from './mappings';

export const getClassifications = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getClassifications', organizationId],
    mutationFn: async (args: ClassificationsFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getTreasuredClassifications(
          organizationId,
          query
        );

      parseAndLog(pagedTreasuredClassificationExtendedDTOSchema, response);

      return response;
    }
  });
