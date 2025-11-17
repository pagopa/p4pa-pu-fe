import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  debtPositionTypeSchema,
  pagedDebtPositionTypeWithCountSchema
} from '../../../generated/zod-schema';
import { DebtPositionTypePatchRequestBody } from '../../../generated/data-contracts';
import {
  buildQueryParams,
  buildQueryPostParams,
  DebtPositionTypeWithCountFilteredRequest
} from './mappings';
import { Step2Data } from '../../routes/DebtTypeCreate/components/Step2Settings';

export const getDebtPositionTypeWithCount = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getDebtPositionTypeWithCount', organizationId],
    mutationFn: async (args: DebtPositionTypeWithCountFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeWithCount(
          organizationId,
          query
        );

      if (response) {
        parseAndLog(pagedDebtPositionTypeWithCountSchema, response);
      }

      return response;
    }
  });

export const postDebtPositionType = () =>
  useMutation({
    mutationKey: ['postDebtPositionType'],
    mutationFn: async (query: Step2Data) => {
      const querySanitizer = buildQueryPostParams(query);
      const response =
        await utils.apiClient.bff.createDebtPositionType(querySanitizer);
      parseAndLog(debtPositionTypeSchema, response.data);
      return response.data;
    }
  });

export const patchDebtPositionType = (debtPositionTypeId: number) =>
  useMutation({
    mutationKey: ['patchDebtPositionType'],
    mutationFn: async (data: DebtPositionTypePatchRequestBody) => {
      const response = await utils.apiClient.bff.patchDebtPositionType(
        debtPositionTypeId,
        data
      );
      return response.data;
    }
  });

export const getDebtPositionTypesByOrganizationId = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useQuery({
    queryKey: ['getDebtPositionTypesByOrganizationId', organizationId],
    queryFn: async () =>
      await utils.apiClient.bff.getDebtPositionTypesByOrganizationId(
        organizationId
      ),
    select: ({ data }) => {
      parseAndLog(debtPositionTypeSchema.array(), data);
      const sorted = data
        .slice()
        .sort((a, b) => a.description.localeCompare(b.description));

      const optionsMap = sorted.map((type) => ({
        label: type.description,
        value: type.debtPositionTypeId
      }));

      const codeMap = sorted.map((type) => ({
        label: type.description,
        value: type.code
      }));

      return { response: data, optionsMap, codeMap };
    }
  });

/**
 * Check if the code is unique for the debt position types of the catalog.
 * Returns true if the code is unique (does not exist), false if it already exists.
 * Strategy:
 * 1. Call getDebtPositionTypeWithCount with size 1 to get totalElements
 * 2. Call with size = totalElements to get all types in one call
 * 3. Search the code in the resulting array
 */
export const useDebtPositionTypeCodeValidation = (organizationId: number) => {
  return useMutation({
    mutationKey: ['validateDebtPositionTypeCode', organizationId],
    mutationFn: async (code: string): Promise<boolean> => {
      if (!code || !code.trim()) {
        return true;
      }

      const codeToCheck = code.trim();

      // First call with size 1 only to get totalElements
      const { data: firstPageResponse } =
        await utils.apiClient.bff.getDebtPositionTypeWithCount(organizationId, {
          page: 0,
          size: 1
        });

      if (!firstPageResponse) {
        return true;
      }

      const totalElements = firstPageResponse.totalElements || 0;

      // If there are no elements, the code is unique
      if (totalElements === 0) {
        return true;
      }

      // Call with size = totalElements to get all types in one call
      const { data: allDataResponse } =
        await utils.apiClient.bff.getDebtPositionTypeWithCount(organizationId, {
          page: 0,
          size: totalElements
        });

      if (!allDataResponse || !allDataResponse.content) {
        return true;
      }

      const data = allDataResponse.content;

      // Check if a type with the same code already exists
      const codeExists = data.some((type) => type.code === codeToCheck);
      const isUnique = !codeExists;

      return isUnique;
    }
  });
};
