import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';

type DebtPositionViewParams = Parameters<typeof utils.apiClient.bff.getDebtPositionViews>;

export type DebtPositionViewQuery = DebtPositionViewParams[1] & {
  status?: DebtPositionViewParams[1]['status'] | 'TUTTI';
};

export type DebtPositionViewRequest = {
  organizationId: DebtPositionViewParams[0];
  query: DebtPositionViewQuery;
};

export const getDebtPositionViews = ({
  organizationId
}: {
  organizationId: DebtPositionViewRequest['organizationId'];
}) =>
  useMutation({
    mutationKey: ['uploadIngestionFlowFiles', organizationId],
    mutationFn: async (query: DebtPositionViewQuery) => {
      const { data: response } = await utils.apiClient.bff.getDebtPositionViews(
        organizationId,
        query,
        {
          paramsSerializer: {
            // repeat array params as query string
            indexes: null
          }
        }
      );

      return response;
    }
  });

export const getDebtPositionsTypes = ({ organizationId }: { organizationId: number }) =>
  useQuery({
    queryKey: ['getDebtPositionsTypes'],
    queryFn: () => utils.apiClient.bff.getDebtPositionTypeWithCount(organizationId),
  });
