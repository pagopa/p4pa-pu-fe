import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedSilRegistrySchema } from '../../../generated/zod-schema';
import { FilteredRequest } from '../../models/Filters';
import {
  SilFilterValues
} from '../../routes/Events/configs';
import { buildQueryParams } from './mapping';

const getSilRegistries = (organizationId: number) =>
  useMutation({
    mutationKey: ['getSilRegistries', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<SilFilterValues>) => {
      const query = buildQueryParams({filters, pagination, sort});
      const { data: response } = await utils.apiClient.bff.getSilRegistries(
        organizationId,
        query
      );
      parseAndLog(pagedSilRegistrySchema, response, false);
      return response;
    }
  });

export default getSilRegistries;
