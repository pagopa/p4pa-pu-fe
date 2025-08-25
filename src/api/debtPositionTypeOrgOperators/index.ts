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

export const getDebtPositionTypeOrgOperators = (
  organizationId: number,
  debtPositionTypeOrgId: number
) =>
  useMutation({
    mutationKey: [
      'getDebtPositionTypeOrgOperators',
      organizationId,
      debtPositionTypeOrgId
    ],
    mutationFn: async (args: DebtPositionTypeOrgOperatorFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgOperators(
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
        parseAndLog(pagedDebtPositionTypeOrgOperatorDTOSchema, response);
      }

      return response;
    }
  });
