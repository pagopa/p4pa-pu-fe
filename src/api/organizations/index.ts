import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema } from '../../../generated/zod-schema';
import {
  buildOrganizationsQueryParams,
  OrganizationsFilteredRequest
} from './mappings';
import { parseAndLog } from '../../utils/loaders';
import { organizationDetailDTOSchema } from '../../../generated/zod-schema';

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
        parseAndLog(organizationDetailDTOSchema, organizationDetail);
      }
      return organizationDetail;
    }
  });
};
