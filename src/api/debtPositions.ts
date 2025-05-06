import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import {
  debtPositionDetailDTOSchema,
  debtPositionDTOSchema,
  installmentDetailDTOSchema
} from '../../generated/zod-schema';
import { AxiosError } from 'axios';
import { DebtPositionDTO } from '../../generated/data-contracts';

type DebtPositionViewParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionViews
>;

export type DebtPositionViewQuery = DebtPositionViewParams[1] & {
  status?: DebtPositionViewParams[1]['status'];
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

const getInstallmentDetail = (
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

const getDebtPositionDetail = (
  organizationId: number,
  debtPositionId: number
) => {
  return useQuery({
    queryKey: ['getDebtPositionDetail', organizationId, debtPositionId],
    queryFn: async () => {
      const { data: debtPosition } =
        await utils.apiClient.bff.getDebtPositionDetail(
          organizationId,
          debtPositionId
        );
      if (debtPosition) {
        parseAndLog(debtPositionDetailDTOSchema, debtPosition);
      }
      return debtPosition;
    },
    enabled: !!organizationId && !!debtPositionId,
    retry: false
  });
};

/** delete a debt position type by its debtPositionTypeId, if allowed */
const deleteDebtPositionType = (
  debtPositionTypeId: number,
  onSuccess?: () => void,
  onError?: (error: AxiosError) => void
) =>
  useMutation({
    mutationFn: () =>
      utils.apiClient.bff.deleteDebtPositionType(debtPositionTypeId),
    onSuccess,
    onError
  });

/** create a new debt position */
const createDebtPosition = (
  onSuccess?: (response: DebtPositionDTO, paymentObject?: string) => void,
  onError?: (error: AxiosError) => void
) =>
  useMutation({
    mutationKey: ['createDebtPosition'],
    mutationFn: async (params: {
      body: DebtPositionDTO;
      paymentObject?: string;
    }) => {
      const response = await utils.apiClient.bff.createDebtPosition(
        params.body
      );
      if (response.data) {
        parseAndLog(debtPositionDTOSchema, response.data);
      }
      return { response: response.data, paymentObject: params.paymentObject };
    },
    onSuccess: (data) => {
      onSuccess?.(data.response, data.paymentObject);
    },
    onError
  });

export default {
  getDebtPositionViews,
  getInstallments,
  getInstallmentDetail,
  getDebtPositionDetail,
  deleteDebtPositionType,
  createDebtPosition
};
