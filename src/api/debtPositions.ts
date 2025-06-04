import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import {
  debtPositionDetailDTOSchema,
  debtPositionDTOSchema,
  installmentDetailDTOSchema
} from '../../generated/zod-schema';
import { AxiosError } from 'axios';
import {
  DebtPositionDTO,
  ManageDebtPositionDTO
} from '../../generated/data-contracts';
import { extractFilename } from '../utils/formatters';

type DebtPositionViewParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionViews
>;

export type DebtPositionViewQuery = DebtPositionViewParams[1];

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
const deleteDebtPositionType = (debtPositionTypeId: number) =>
  useMutation({
    mutationFn: () =>
      utils.apiClient.bff.deleteDebtPositionType(debtPositionTypeId)
  });

/** delete a debt position type org by its organizationId and debtPositionTypeOrgId, if allowed */
const deleteDebtPositionTypeOrgs = (
  organizationId: number,
  debtPositionTypeOrgId: number
) =>
  useMutation({
    mutationFn: () =>
      utils.apiClient.bff.deleteDebtPositionTypeOrg(
        organizationId,
        debtPositionTypeOrgId
      )
  });

/** delete a debt position by its organizationId and debtPositionId, if allowed */
const deleteDebtPosition = (
  organizationId: number,
  debtPositionId: number,
  onSuccess?: () => void,
  onError?: (error: AxiosError) => void
) =>
  useMutation({
    mutationFn: () =>
      utils.apiClient.bff.deleteDebtPosition(organizationId, debtPositionId),
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

/** manage debt position installments (edit mode) */
const manageDebtPositionInstallments = (
  onSuccess?: (response: DebtPositionDTO) => void,
  onError?: (error: AxiosError) => void
) =>
  useMutation({
    mutationKey: ['manageDebtPositionInstallments'],
    mutationFn: async (params: {
      organizationId: number;
      debtPositionId: number;
      body: ManageDebtPositionDTO;
      publish?: boolean;
    }) => {
      const response = await utils.apiClient.bff.manageDebtPositionInstallments(
        params.organizationId,
        params.debtPositionId,
        params.body,
        params.publish ? { publish: params.publish } : undefined
      );
      if (response.data) {
        parseAndLog(debtPositionDTOSchema, response.data);
      }
      return response.data;
    },
    onSuccess,
    onError
  });

/** returns a mutation to download the payment notice file */
const getPaymentNoticeFile = (
  organizationId: number,
  debtPositionId: number,
  iuv: string
) =>
  useMutation({
    mutationKey: ['getPaymentNoticeFile', organizationId, debtPositionId, iuv],
    mutationFn: async () => {
      const response = await utils.apiClient.bff.getPaymentNotice(
        organizationId,
        debtPositionId,
        { iuv },
        { format: 'blob' }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) || `notice-${iuv}.pdf`;

      return { data: response.data, fileName };
    }
  });

/** returns a mutation to get export blob file of unpaid/unpayable installment notices for a debt position */
const getDebtPositionZipFile = (organizationId: number) =>
  useMutation({
    mutationKey: ['getDebtPositionZipFile', organizationId],
    mutationFn: async (debtPositionId: number) => {
      const response = await utils.apiClient.bff.getUnpaidPaymentNoticeZip(
        organizationId,
        debtPositionId,
        { format: 'blob' }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) ||
        `debt-position-${debtPositionId}.zip`;

      return { data: response.data, fileName };
    }
  });

export default {
  getDebtPositionViews,
  getInstallments,
  getInstallmentDetail,
  getDebtPositionDetail,
  deleteDebtPositionType,
  deleteDebtPositionTypeOrgs,
  deleteDebtPosition,
  createDebtPosition,
  manageDebtPositionInstallments,
  getPaymentNoticeFile,
  getDebtPositionZipFile
};
