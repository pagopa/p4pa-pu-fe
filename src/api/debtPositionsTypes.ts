import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import {
  debtPositionTypeSchema,
  pagedDebtPositionTypeWithCountSchema
} from '../../generated/zod-schema';
import {
  DebtPositionTypePatchRequestBody,
  DebtPositionTypeRequestBody
} from '../../generated/data-contracts';

export const getDebtPositionsTypes = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useQuery({
    queryKey: ['getDebtPositionsTypes', organizationId],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgs(organizationId);
      return response;
    }
  });

type DebtPositionTypeWithCountParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionTypeWithCount
>;

export type DebtPositionTypeWithCountQuery = DebtPositionTypeWithCountParams[1];

export type DebtPositionTypeWithCountRequest = {
  organizationId: DebtPositionTypeWithCountParams[0];
  query: DebtPositionTypeWithCountQuery;
};

export const getDebtPositionTypeWithCount = (
  organizationId: number,
  query: {
    page?: number;
    size?: number;
    sort?: Array<string>;
  }
) =>
  useQuery({
    queryKey: ['getDebtPositionTypeWithCount', organizationId, query],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeWithCount(
          organizationId,
          query,
          {
            paramsSerializer: {
              // repeat array params as query string
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
