import { FilteredRequest } from '@core/models/Filters';
import utils from '@core/utils';
import { parseAndLog } from '@core/utils/loaders';
import { pagedOrgSubUnitSchema } from '@generated/core/zod-schema';
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
      parseAndLog(pagedOrgSubUnitSchema, response);
      return response;
    }
  });

export const deleteOrgSubUnitById = (
  organizationId: number,
  subUnitCode: string
) =>
  useMutation({
    mutationKey: ['deleteOrgSubUnitById', organizationId, subUnitCode],
    mutationFn: async () => {
      const { data: response } = await utils.apiClient.bff.deleteOrgSubUnitById(
        organizationId,
        subUnitCode
      );
      return response;
    }
  });
