import { useMutation } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { pagedDebtPositionTypeOrgOperatorDTOSchema } from '../../../generated/zod-schema';
import {
  buildQueryParams,
  DebtPositionTypeOrgOperatorFilteredRequest
} from './mappings';

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
