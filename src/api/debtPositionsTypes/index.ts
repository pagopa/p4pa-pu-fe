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
