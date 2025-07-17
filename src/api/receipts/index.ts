import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { buildQueryParams, TelematicReceiptsFilteredRequest } from './mappings';

export const getReceipts = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getReceipts', organizationId],
    mutationFn: async (args: TelematicReceiptsFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data } = await utils.apiClient.bff.getReceipts(
        organizationId,
        query,
        // repeat array params as query string
        {
          paramsSerializer: {
            indexes: null
          }
        }
      );
      return data;
    }
  });
