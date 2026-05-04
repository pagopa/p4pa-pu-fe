import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import {
  pagedDebtPositionTypeOrgWithCountSchema,
  pagedOrganizationWithDebtPositionTypeOrgCountSchema
} from '../../generated/zod-schema';
import { FilteredRequest } from '../models/Filters';

export type DebtPositionTypeOrgWithCountFilters = {
  code?: string;
  description?: string;
  flagActive?: boolean;
};

export const useDebtPositionTypeOrgSearch = (organizationId: number) => {
  return useMutation({
    mutationKey: ['searchDebtPositionTypeOrg', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<DebtPositionTypeOrgWithCountFilters>) => {
      const query = { ...filters, ...pagination, sort };
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgWithCount(
          organizationId,
          query
        );

      if (response) {
        parseAndLog(pagedDebtPositionTypeOrgWithCountSchema, response);
      }

      return response;
    }
  });
};

export type OrganizationsWithDebtPositionTypeOrgCountFilters = {
  organizationName?: string;
};

export const useManagedOrgsSearch = (organizationId: number) => {
  return useMutation({
    mutationKey: ['searchManagedOrgs', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: FilteredRequest<OrganizationsWithDebtPositionTypeOrgCountFilters>) => {
      const query = { ...filters, ...pagination, sort };
      const { data: response } =
        await utils.apiClient.bff.getOrganizationsWithDebtPositionTypeOrgCount(
          organizationId,
          query
        );

      if (response) {
        parseAndLog(
          pagedOrganizationWithDebtPositionTypeOrgCountSchema,
          response
        );
      }

      return response;
    }
  });
};
