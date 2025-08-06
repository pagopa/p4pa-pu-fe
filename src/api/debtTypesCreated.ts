import { useMutation } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import {
  pagedDebtPositionTypeOrgWithCountSchema,
  pagedOrganizationWithDebtPositionTypeOrgCountSchema
} from '../../generated/zod-schema';

export const useDebtPositionTypeOrgSearch = () => {
  return useMutation({
    mutationKey: ['searchDebtPositionTypeOrg'],
    mutationFn: async ({
      organizationId,
      filters
    }: {
      organizationId: number;
      filters: Record<string, string | number | boolean | Array<string>>;
    }) => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgWithCount(
          organizationId,
          filters
        );

      if (response) {
        parseAndLog(pagedDebtPositionTypeOrgWithCountSchema, response);
      }

      return response;
    }
  });
};

export const useManagedOrgsSearch = () => {
  return useMutation({
    mutationKey: ['searchManagedOrgs'],
    mutationFn: async ({
      organizationId,
      filters
    }: {
      organizationId: number;
      filters: Record<string, string | number | boolean | Array<string>>;
    }) => {
      const { data: response } =
        await utils.apiClient.bff.getOrganizationsWithDebtPositionTypeOrgCount(
          organizationId,
          filters,
          {
            paramsSerializer: {
              // repeat array params as query string
              indexes: null
            }
          }
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
