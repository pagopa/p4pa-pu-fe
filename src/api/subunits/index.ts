import { FilteredRequest } from '@core/models/Filters';
import utils from '@core/utils';
import { OrgSubUnitStatus, SubUnitType } from '@generated/core/data-contracts';
import { useMutation } from '@tanstack/react-query';

export type SubUnitsFilters = {
  subUnitCode?: string;
  status?: OrgSubUnitStatus;
  subUnitType?: SubUnitType;
};

export type SubUnitsFilteredRequest = FilteredRequest<SubUnitsFilters>;

export const getPagedOrgSubUnits = (organizationId: number) =>
  useMutation({
    mutationKey: ['getPagedOrgSubUnits', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: SubUnitsFilteredRequest) => {
      const query = {
        ...filters,
        ...pagination,
        sort
      };
      const { data: response } = await utils.apiClient.bff.getPagedOrgSubUnits(
        organizationId,
        query
      );
      return response;
    }
  });
