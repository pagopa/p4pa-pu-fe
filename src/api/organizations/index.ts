import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema } from '../../../generated/zod-schema';
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

      parseAndLog(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema,
        response
      );

      return response;
    }
  });
