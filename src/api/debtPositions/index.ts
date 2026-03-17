import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  debtPositionDetailDTOSchema,
  debtPositionDTOSchema,
  debtPositionRegistrySchema,
  installmentDetailDTOSchema,
  installmentRegistrySchema,
  pagedDebtPositionViewSchema,
  pagedInstallmentViewSchema
} from '../../../generated/zod-schema';
import { AxiosError } from 'axios';
import {
  DebtPositionDTO,
  ManageDebtPositionDTO
} from '../../../generated/data-contracts';
import { extractFilename } from '../../utils/formatters';
import {
  buildDebtPositionsQueryParams,
  buildInstallmentsQueryParams,
  DebtPositionFilteredRequest,
  InstallmentsFilteredRequest
} from './mapping';
import { z } from 'zod';

const getDebtPositionViews = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getDebtPositionViews', organizationId],
    mutationFn: async (args: DebtPositionFilteredRequest) => {
      const query = buildDebtPositionsQueryParams(args);
      const { data } = await utils.apiClient.bff.getDebtPositionViews(
        organizationId,
        query
      );
      parseAndLog(pagedDebtPositionViewSchema, data);
      return data;
    }
  });

const getInstallments = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getInstallments', organizationId],
    mutationFn: async (args: InstallmentsFilteredRequest) => {
      const query = buildInstallmentsQueryParams(args);
      const { data } = await utils.apiClient.bff.getInstallments(
        organizationId,
        query
      );
      parseAndLog(pagedInstallmentViewSchema, data);
      return data;
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
      parseAndLog(installmentDetailDTOSchema, installment);
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
      parseAndLog(debtPositionDetailDTOSchema, debtPosition);
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
    mutationKey: [
      'deleteDebtPositionTypeOrgs',
      organizationId,
      debtPositionTypeOrgId
    ],
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

/** publish a debt position from DRAFT to UNPAID status by its organizationId and debtPositionId */
const publishDebtPosition = (
  organizationId: number,
  debtPositionId: number,
  onSuccess?: () => void,
  onError?: (error: AxiosError) => void
) =>
  useMutation({
    mutationFn: () =>
      utils.apiClient.bff.publishDebtPosition(organizationId, debtPositionId),
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
      parseAndLog(debtPositionDTOSchema, response.data);
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
      parseAndLog(debtPositionDTOSchema, response.data);
      return response.data;
    },
    onSuccess,
    onError
  });

/** returns a mutation to download the payment notice file */
const getPaymentNoticeFile = (
  organizationId: number,
  debtPositionId: number,
  nav: string
) =>
  useMutation({
    mutationKey: ['getPaymentNoticeFile', organizationId, debtPositionId, nav],
    mutationFn: async () => {
      const response = await utils.apiClient.bff.getPaymentNotice(
        organizationId,
        debtPositionId,
        { nav },
        { format: 'blob' }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const fileName =
        extractFilename(contentDisposition) || `notice-${nav}.pdf`;

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

const getDebtPositionRegistriesMutation = () => {
  return useMutation({
    mutationKey: ['getDebtPositionRegistriesMutation'],
    mutationFn: async ({
      organizationId,
      debtPositionId
    }: {
      organizationId: number;
      debtPositionId: number;
    }) => {
      const { data: registries } =
        await utils.apiClient.bff.getDebtPositionRegistries(
          organizationId,
          debtPositionId
        );
      parseAndLog(z.array(debtPositionRegistrySchema), registries);
      return registries || [];
    }
  });
};

const getInstallmentRegistriesMutation = () => {
  return useMutation({
    mutationKey: ['getInstallmentRegistriesMutation'],
    mutationFn: async ({
      organizationId,
      debtPositionId,
      nav
    }: {
      organizationId: number;
      debtPositionId: number;
      nav: string;
    }) => {
      const { data: registries } =
        await utils.apiClient.bff.getInstallmentRegistries(
          organizationId,
          debtPositionId,
          {
            nav: nav
          }
        );
      parseAndLog(z.array(installmentRegistrySchema), registries);
      return registries || [];
    }
  });
};

export default {
  createDebtPosition,
  deleteDebtPosition,
  deleteDebtPositionType,
  deleteDebtPositionTypeOrgs,
  getDebtPositionDetail,
  getDebtPositionRegistriesMutation,
  getDebtPositionViews,
  getDebtPositionZipFile,
  getInstallmentDetail,
  getInstallmentRegistriesMutation,
  getInstallments,
  getPaymentNoticeFile,
  manageDebtPositionInstallments,
  publishDebtPosition
};
