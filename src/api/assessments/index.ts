import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import {
  AssessmentsRegistriesFilteredRequest,
  buildQueryParams
} from './mappings';

export const getAssessmentsRegistries = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getTreasuries', organizationId],
    mutationFn: async (args: AssessmentsRegistriesFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getAssessmentsRegistries(
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
