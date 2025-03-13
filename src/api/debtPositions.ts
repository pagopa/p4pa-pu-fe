import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';

type DebtPositionViewParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionViews
>;

export type DebtPositionViewQuery = DebtPositionViewParams[1] & {
  status?: DebtPositionViewParams[1]['status'] | 'TUTTI';
};

export type DebtPositionViewRequest = {
  organizationId: DebtPositionViewParams[0];
  query: DebtPositionViewQuery;
};

const getDebtPositionViews = ({
  organizationId
}: {
  organizationId: DebtPositionViewRequest['organizationId'];
}) =>
  useMutation({
    mutationKey: ['getDebtPositionViews', organizationId],
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

const getDebtPositionsTypes = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useQuery({
    queryKey: ['getDebtPositionsTypes'],
    queryFn: async () => {
      const { data: response } =
        await utils.apiClient.bff.getDebtPositionTypeOrgs(organizationId);
      return response;
    }
  });

type DebtPositionInstallmentsParams = Parameters<
  typeof utils.apiClient.bff.getInstallments
>;

export type DebtPositionInstallmentsQuery = DebtPositionInstallmentsParams[1];

export type DebtPositionInstallmentsRequest = {
  organizationId: DebtPositionInstallmentsParams[0];
  query: DebtPositionInstallmentsQuery;
};

const getInstallments = ({
  organizationId
}: {
  organizationId: DebtPositionInstallmentsRequest['organizationId'];
}) =>
  useMutation({
    mutationKey: ['getInstallments', organizationId],
    mutationFn: async (query: DebtPositionInstallmentsQuery) => {
      const { data: response } = await utils.apiClient.bff.getInstallments(
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

export default { getDebtPositionViews, getDebtPositionsTypes, getInstallments };
