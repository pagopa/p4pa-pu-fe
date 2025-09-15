import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  pagedOrganizationOperatorSchema,
  pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
} from '../../../generated/zod-schema';
import { FilteredRequest } from '../../models/Filters';

export type OrganizationOperatorsFilters = {
  firstName?: string;
  lastName?: string;
  fiscalCode?: string;
};

export const useOrganizationOperatorsSearch = (organizationId: number) => {
  return useMutation({
    mutationKey: ['searchOrganizationOperators', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<OrganizationOperatorsFilters>) => {
      const query = { ...filters, ...pagination, sort };
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

export type BrokerOrganizationsFilters = {
  orgName?: string;
  ipaCode?: string;
};

export const useBrokerOrganizationsSearch = () => {
  return useMutation({
    mutationKey: ['searchBrokerOrganizations'],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<BrokerOrganizationsFilters>) => {
      const query = { ...filters, ...pagination, sort };
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
