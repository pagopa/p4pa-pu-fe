import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedPagoPaRegistrySchema } from '../../generated/zod-schema';

type OrgID = Parameters<typeof utils.apiClient.bff.getPagoPaRegistries>['0'];
type Query = Parameters<typeof utils.apiClient.bff.getPagoPaRegistries>['1'];

const getPagoPaRegistries = (organizationId: OrgID) =>
  useMutation({
    mutationKey: ['getPagoPaRegistries', organizationId],
    mutationFn: async (query: Query) => {
      const { data: response } = await utils.apiClient.bff.getPagoPaRegistries(
        organizationId,
        query
      );
      parseAndLog(pagedPagoPaRegistrySchema, response);
      return response;
    }
  });

export default getPagoPaRegistries;
