import { useMutation } from '@tanstack/react-query';
import utils from '../utils';

type ClassificationsParams = Parameters<
  typeof utils.apiClient.bff.getTreasuredClassifications
>;
export type ClassificationsQuery = ClassificationsParams[1];

export type ClassificationsRequest = {
  organizationId: ClassificationsParams[0];
  query: ClassificationsQuery;
};

export const getClassifications = (
  organizationId: ClassificationsRequest['organizationId']
) =>
  useMutation({
    mutationKey: ['getClassifications', organizationId],
    mutationFn: async (query: ClassificationsQuery) => {
      const { data: response } =
        await utils.apiClient.bff.getTreasuredClassifications(
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
