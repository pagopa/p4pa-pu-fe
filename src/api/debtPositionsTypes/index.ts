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
        value: String(type.debtPositionTypeId)
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
 * Single API call with code filter and size: 1. If content.length === 0, the code is unique.
 */
export const useDebtPositionTypeCodeValidation = (organizationId: number) => {
  return useMutation({
    mutationKey: ['validateDebtPositionTypeCode', organizationId],
    mutationFn: async (code: string): Promise<boolean> => {
      if (!code || !code.trim()) {
        return true; // Empty code cannot be duplicated
      }

      const codeToCheck = code.trim();

      // Single call with code filter and size: 1
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeWithCount(organizationId, {
          code: codeToCheck,
          page: 0,
          size: 1
        });

      if (!response) {
        return true; // Fail-safe: in case of error, consider code valid
      }

      // If content is null or empty, the code is unique
      const isUnique = !response.content || response.content.length === 0;

      return isUnique;
    }
  });
};
