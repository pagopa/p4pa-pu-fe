import { useMutation } from '@tanstack/react-query';
import utils from '../utils';

type TreasuriesParams = Parameters<typeof utils.apiClient.bff.getTreasuries>;
export type TreasuriesQuery = TreasuriesParams[1];

export type TreasuriesRequest = {
  organizationId: TreasuriesParams[0];
  query: TreasuriesQuery;
};

export const getTreasuries = (
  organizationId: TreasuriesRequest['organizationId']
) =>
  useMutation({
    mutationKey: ['getTreasuries', organizationId],
    mutationFn: async (query: TreasuriesQuery) => {
      const { data: response } = await utils.apiClient.bff.getTreasuries(
        organizationId,
        query,
        {
          paramsSerializer: {
            // repeat array params as query string
            indexes: null
          }
        }
      );

      return response;
    }
  });
