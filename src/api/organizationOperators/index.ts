import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  operatorsDetailSchema,
  pagedDebtPositionTypeOrgDTOSchema,
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

      try {
        const { data } = await utils.apiClient.bff.getOperatorDetails(
          organizationId,
          mappedExternalUserId,
          query
        );
        parseAndLog(operatorsDetailSchema, data);
        return data;
      } catch (error) {
        // TODO: status error should be handled in an interceptor;
        console.error(error);
        return;
      }
    }
  });
};

export type OperatorDebtPositionQuery = Omit<
  Parameters<
    typeof utils.apiClient.bff.getDebtPositionTypeOrgsNotEnabledForOperator
  >[2],
  'page' | 'size' | 'sort'
>;

export const useOperatorDebtPositionTypeOrgSearch = (
  organizationId: number,
  mappedExternalUserId: string
) =>
  useMutation({
    mutationKey: [
      'searchOperatorDebtPosition',
      organizationId,
      mappedExternalUserId
    ],
    mutationFn: async (args: FilteredRequest<OperatorDebtPositionQuery>) => {
      const query = {
        ...args.filters,
        ...args.pagination,
        sort: args.sort
      };
      const { data } =
        await utils.apiClient.bff.getDebtPositionTypeOrgsNotEnabledForOperator(
          organizationId,
          mappedExternalUserId,
          query
        );
      parseAndLog(pagedDebtPositionTypeOrgDTOSchema, data);
      return data;
    }
  });

type EnableDebtPositionTypeOrgsForOperatorQuery = Parameters<
  typeof utils.apiClient.bff.enableDebtPositionTypeOrgsForOperator
>[2];

export const useEnbleDebtPositionTypeOrgsForOperator = (
  organizationId: number,
  mappedExternalUserId: string
) =>
  useMutation({
    mutationKey: [
      'useEnbleDebtPositionTypeOrgsForOperator',
      organizationId,
      mappedExternalUserId
    ],
    mutationFn: async (query: EnableDebtPositionTypeOrgsForOperatorQuery) => {
      const { data } =
        await utils.apiClient.bff.enableDebtPositionTypeOrgsForOperator(
          organizationId,
          mappedExternalUserId,
          query
        );
      return data;
    }
  });
