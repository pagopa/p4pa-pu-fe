import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedSilRegistrySchema } from '../../generated/zod-schema';
import { FilteredRequest } from '../models/Filters';
import {
  getQueryFromFilterValues,
  SilFilterValues
} from '../routes/Events/configs';

const getSilRegistries = (organizationId: number) =>
  useMutation({
    mutationKey: ['getSilRegistries', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<SilFilterValues>) => {
      const query = {
        ...getQueryFromFilterValues(filters),
        ...pagination,
        sort
      };
      const { data: response } = await utils.apiClient.bff.getSilRegistries(
        organizationId,
        query
      );
      parseAndLog(pagedSilRegistrySchema, response, false);
      return response;
    }
  });

export default getSilRegistries;
