import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { pagedDebtPositionTypeOrgOperatorDTOSchema } from '../../generated/zod-schema';

export const getDebtPositionTypeOrgOperators = (
  organizationId: number,
  query: {
    debtPositionTypeOrgId?: number;
    page?: number;
    size?: number;
    sort?: Array<string>;
  }
) =>
  useQuery({
    queryKey: ['getDebtPositionTypeOrgOperators', organizationId, query],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgOperators(
          organizationId,
          query
        );

      if (response) {
        parseAndLog(pagedDebtPositionTypeOrgOperatorDTOSchema, response);
      }

      return response;
    }
  });
