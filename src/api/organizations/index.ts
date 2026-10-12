import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema } from '../../../generated/core/zod-schema';
import {
  buildOrganizationsQueryParams,
  OrganizationsFilteredRequest
} from './mappings';
import { parseAndLog } from '../../utils/loaders';
import { organizationDetailSchema } from '../../../generated/core/zod-schema';
import { OrganizationUpdateDTO } from '@generated/core/client';

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

export const getOrganizationDetail = (organizationId: number) => {
  return useQuery({
    queryKey: ['organizationDetail', organizationId],
    queryFn: async () => {
      const { data: organizationDetail } =
        await utils.apiClient.bff.getOrganizationDetail(organizationId);

      if (organizationDetail) {
        parseAndLog(organizationDetailSchema, organizationDetail);
      }
      return organizationDetail;
    }
  });
};

export const updateOrganization = () =>
  useMutation({
    mutationKey: ['updateOrganization'],
    mutationFn: async ({
      organizationId,
      organizationData
    }: {
      organizationId: number;
      organizationData: OrganizationUpdateDTO;
    }) => {
      await utils.apiClient.bff.updateOrganization(
        organizationId,
        organizationData
      );
    }
  });
