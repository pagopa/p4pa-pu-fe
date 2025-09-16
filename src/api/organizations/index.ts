import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import {
  buildOrganizationsQueryParams,
  OrganizationsFilteredRequest
} from './mappings';

export const getOrganizationsByBrokerIdAndFilters = () =>
  useMutation({
    mutationKey: ['getOrganizationsByBrokerIdAndFilters'],
    mutationFn: async (args: OrganizationsFilteredRequest) => {
      const query = buildOrganizationsQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getOrganizationsByBrokerIdAndFilters(query);
      return response;
    }
  });
