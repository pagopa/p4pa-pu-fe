import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  operatorsDetailSchema,
  pagedOrganizationOperatorSchema,
  pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
} from '../../../generated/zod-schema';
import {
  buildOrganizationOperatorsQueryParams,
  buildBrokerOrganizationsQueryParams,
  OrganizationOperatorsFilteredRequest,
  BrokerOrganizationsFilteredRequest
} from './mappings';
import { FilteredRequest } from '../../models/Filters';

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

export type OperatorDetailQuery = Omit<
  Parameters<typeof utils.apiClient.bff.getOperatorDetails>[2],
  'page' | 'size' | 'sort'
>;

export const useOperatorDetailSearch = (
  organizationId: number,
  mappedExternalUserId: string
) => {
  return useMutation({
    mutationKey: ['searchOperatorDetail', organizationId, mappedExternalUserId],
    mutationFn: async (args: FilteredRequest<OperatorDetailQuery>) => {
      const query = {
        ...args.filters,
        ...args.pagination,
        sort: args.sort
      };

      const { data } = await utils.apiClient.bff.getOperatorDetails(
        organizationId,
        mappedExternalUserId,
        query
      );

      parseAndLog(operatorsDetailSchema, data);
      return data;
    }
  });
};
