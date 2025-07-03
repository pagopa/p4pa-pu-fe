import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedSilRegistrySchema } from '../../generated/zod-schema';

type OrgID = Parameters<typeof utils.apiClient.bff.getSilRegistries>['0'];
type Query = Parameters<typeof utils.apiClient.bff.getSilRegistries>['1'];

const getSilRegistries = (organizationId: OrgID) =>
  useMutation({
    mutationKey: ['getSilRegistries', organizationId],
    mutationFn: async (query: Query) => {
      const { data: response } = await utils.apiClient.bff.getSilRegistries(
        organizationId,
        query
      );
      parseAndLog(pagedSilRegistrySchema, response, false);
      return response;
    }
  });

export default getSilRegistries;
