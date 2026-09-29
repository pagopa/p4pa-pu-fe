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
  mappedExternalUserId?: string;
};

export type SubUnitsFilteredRequest = FilteredRequest<SubUnitsFilters>;

export const getOperatorOrgSubUnits = (
  organizationId: number,
  mappedExternalUserId: string
) =>
  useMutation({
    mutationKey: [
      'getOperatorOrgSubUnits',
      organizationId,
      mappedExternalUserId
    ],
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
      const { data: response } =
        await utils.apiClient.bff.getOperatorOrgSubUnits(
          organizationId,
          mappedExternalUserId,
          query
        );
      parseAndLog(pagedOrgSubUnitSchema, response);
      return response;
    }
  });

export const getPagedOrgSubUnits = (organizationId: number) =>
  useMutation({
    mutationKey: ['getPagedOrgSubUnits', organizationId],
    mutationFn: async (query: SubUnitsFilteredRequest) => {
      const { filters, pagination, sort } = query;
      const { data: response } = await utils.apiClient.bff.getPagedOrgSubUnits(
        organizationId,
        {
          ...filters,
          ...pagination,
          sort
        }
      );
      parseAndLog(pagedOrgSubUnitSchema, response);
      return response;
    }
  });

export const deleteOrgSubUnitFromOperator = (
  organizationId: number,
  mappedExternalUserId: string
) =>
  useMutation({
    mutationKey: [
      'deleteOrgSubUnitFromOperator',
      organizationId,
      mappedExternalUserId
    ],
    mutationFn: async (subUnitCode: string) => {
      const { data: response } =
        await utils.apiClient.bff.deleteOrgSubUnitFromOperator(
          organizationId,
          mappedExternalUserId,
          subUnitCode
        );
      return response;
    }
  });

// TODO: add filters when available
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type SubUnitsOperatorsFilters = {};

export type SubUnitOperatorsFilteredRequest =
  FilteredRequest<SubUnitsOperatorsFilters>;

export const getOrgSubUnitOperators = (
  organizationId: number,
  subUnitCode: string
) =>
  useMutation({
    mutationKey: ['getOrgSubUnitOperators', organizationId, subUnitCode],
    mutationFn: async (query: SubUnitOperatorsFilteredRequest) => {
      const { pagination, sort } = query;
      const { data: response } =
        await utils.apiClient.bff.getOrgSubUnitOperators(
          organizationId,
          subUnitCode,
          {
            ...pagination,
            sort
          }
        );
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
      await utils.apiClient.bff.deleteOrgSubUnitById(
        organizationId,
        subUnitCode
      );
    }
  });
