import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  debtPositionTypeSchema,
  pagedDebtPositionTypeWithCountSchema
} from '../../../generated/zod-schema';
import {
  DebtPositionTypePatchRequestBody,
  DebtPositionTypeRequestBody
} from '../../../generated/data-contracts';
import {
  buildQueryParams,
  DebtPositionTypeWithCountFilteredRequest
} from './mappings';

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
          query,
          // repeat array params as query string
          {
            paramsSerializer: {
              indexes: null
            }
          }
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
    mutationFn: async (query: DebtPositionTypeRequestBody) => {
      const response = await utils.apiClient.bff.createDebtPositionType(query);
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
