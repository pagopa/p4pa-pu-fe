import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedPagoPaRegistrySchema } from '../../generated/zod-schema';
import { FilteredRequest } from '../models/Filters';
import {
  getQueryFromFilterValues,
  NodoFilterValues
} from '../routes/Events/configs';

const getPagoPaRegistries = (organizationId: number) =>
  useMutation({
    mutationKey: ['getPagoPaRegistries', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<NodoFilterValues>) => {
      const query = {
        ...getQueryFromFilterValues(filters),
        ...pagination,
        sort
      };
      const { data: response } = await utils.apiClient.bff.getPagoPaRegistries(
        organizationId,
        query
      );
      parseAndLog(pagedPagoPaRegistrySchema, response, false);
      return response;
    }
  });

export default getPagoPaRegistries;
