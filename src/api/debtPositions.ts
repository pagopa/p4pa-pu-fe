import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { installmentDetailDTOSchema } from '../../generated/zod-schema';

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

export const getInstallmentDetail = (
  organizationId: number,
  installmentId: number
) => {
  return useQuery({
    queryKey: ['installmentDetail', organizationId, installmentId],
    queryFn: async () => {
      const { data: installment } =
        await utils.apiClient.bff.getInstallmentDetail(
          organizationId,
          installmentId
        );
      if (installment) {
        parseAndLog(installmentDetailDTOSchema, installment);
      }
      return installment;
    },
    enabled: !!organizationId && !!installmentId,
    retry: false
  });
};

export default { getDebtPositionViews, getInstallments };
