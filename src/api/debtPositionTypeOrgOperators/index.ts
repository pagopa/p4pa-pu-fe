import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedDebtPositionTypeOrgOperatorDTOSchema } from '../../../generated/zod-schema';
import {
  buildQueryParams,
  DebtPositionTypeOrgOperatorFilteredRequest
} from './mappings';

export type DebtPositionTypeOrgOperatorQuery = {
  debtPositionTypeOrgId?: number;
  page?: number;
  size?: number;
  sort?: Array<string>;
};

export const getDebtPositionTypeOrgOperators = (organizationId: number) =>
  useMutation({
    mutationKey: ['getDebtPositionTypeOrgOperators', organizationId],
    mutationFn: async (args: DebtPositionTypeOrgOperatorFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgOperators(
          organizationId,
          query
        );
      parseAndLog(pagedDebtPositionTypeOrgOperatorDTOSchema, response);
      return response;
    }
  });

export const removeDebtPositionTypeOrgFromOperator = () =>
  useMutation({
    mutationKey: ['removeDebtPositionTypeOrgFromOperator'],
    mutationFn: (params: {
      organizationId: number;
      mappedExternalUserId: string;
      debtPositionTypeOrgId: number;
    }) =>
      utils.apiClient.bff.removeDebtPositionTypeOrgFromOperator(
        params.organizationId,
        params.mappedExternalUserId,
        params.debtPositionTypeOrgId
      )
  });
