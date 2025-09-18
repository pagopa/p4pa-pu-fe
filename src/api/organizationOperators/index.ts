import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  pagedOrganizationOperatorSchema,
  pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
} from '../../../generated/zod-schema';
import {
  buildOrganizationOperatorsQueryParams,
  buildBrokerOrganizationsQueryParams,
  OrganizationOperatorsFilteredRequest,
  BrokerOrganizationsFilteredRequest
} from './mappings';

export const useOrganizationOperatorsSearch = (organizationId: number) => {
  return useMutation({
    mutationKey: ['searchOrganizationOperators', organizationId],
    mutationFn: async (args: OrganizationOperatorsFilteredRequest) => {
      const query = buildOrganizationOperatorsQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getOrganizationOperators(
          organizationId,
          query
        );

      parseAndLog(pagedOrganizationOperatorSchema, response);

      return response;
    }
  });
};

export const useBrokerOrganizationsSearch = () => {
  return useMutation({
    mutationKey: ['searchBrokerOrganizations'],
    mutationFn: async (args: BrokerOrganizationsFilteredRequest) => {
      const query = buildBrokerOrganizationsQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getOrganizationsByBrokerIdAndFilters(query);

      parseAndLog(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema,
        response
      );

      return response;
    }
  });
};
