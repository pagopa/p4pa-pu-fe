import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { buildQueryParams, TreasuriesFilteredRequest } from './mappings';

export const getTreasuries = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getTreasuries', organizationId],
    mutationFn: async (args: TreasuriesFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } = await utils.apiClient.bff.getTreasuries(
        organizationId,
        query
      );

      return response;
    }
  });
