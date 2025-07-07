import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { buildQueryParams, ClassificationsFilteredRequest } from './mappings';

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
          query,
          // repeat array params as query string
          {
            paramsSerializer: {
              indexes: null
            }
          }
        );

      return response;
    }
  });
