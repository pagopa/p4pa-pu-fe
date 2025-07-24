import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/GlobalStore';
import utils from '../utils';
import { AxiosError } from 'axios';
import { getPaidInstallments } from '../api/classifications/paidInstallments';
import {
  PaidInstallmentsFilteredRequest,
  PagedPaidInstallmentsDTO,
  PaidInstallmentsFilters
} from '../api/classifications/paidInstallments/mappings';

type UsePaidInstallmentsParams = {
  enabled?: boolean;
  pageSize?: number;
  debtPositionTypeOrgCode: string;
  assessmentId?: number;
  onError?: (error: AxiosError) => void;
};

type FetchPaidInstallmentsParams = {
  filters?: PaidInstallmentsFilters;
  pagination?: {
    page: number;
    size: number;
  };
  sort?: Array<string>;
};

type UsePaidInstallmentsResult = {
  fetchPaidInstallments: (
    params?: FetchPaidInstallmentsParams
  ) => Promise<PagedPaidInstallmentsDTO>;
  data?: PagedPaidInstallmentsDTO;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isSuccess: boolean;
  isPending: boolean;
};

/**
 * Custom hook to retrieve paid installments for an organization
 *
 * Uses the unified API endpoint that supports both normal mode
 * and assessment creation mode through the optional assessmentId parameter.
 *
 * @param params - Hook configuration parameters
 * @returns Hook with methods and properties to manage paid installments
 */
export const usePaidInstallments = ({
  enabled = true,
  pageSize = 10,
  debtPositionTypeOrgCode,
  assessmentId,
  onError
}: UsePaidInstallmentsParams): UsePaidInstallmentsResult => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  if (enabled && !debtPositionTypeOrgCode) {
    throw new Error('debtPositionTypeOrgCode is required');
  }

  const paidInstallmentsQuery = getPaidInstallments({ organizationId });
  const { data, error, isError, isSuccess, isPending, mutateAsync } =
    paidInstallmentsQuery;

  const handleError = useCallback(
    (error: unknown) => {
      const axiosError = error as AxiosError;
      const isServerError =
        axiosError?.response?.status && axiosError.response.status >= 500;

      // Show notification only for non-server errors (4xx)
      if (!isServerError) {
        utils.notify.emit(t('errors.fetchPaidInstallments'), 'error');
      }

      if (onError && axiosError) {
        onError(axiosError);
      }

      console.error('Error fetching paid installments:', error);
    },
    [t, onError]
  );

  const fetchPaidInstallments = useCallback(
    async (
      params?: FetchPaidInstallmentsParams
    ): Promise<PagedPaidInstallmentsDTO> => {
      if (!enabled) {
        throw new Error('Hook is disabled');
      }

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      try {
        const pagination = params?.pagination || {
          page: 0,
          size: pageSize
        };

        const request: PaidInstallmentsFilteredRequest = {
          debtPositionTypeOrgCode,
          ...(assessmentId && { assessmentId }),
          filters: params?.filters,
          pagination,
          sort: params?.sort
        };

        const result = await mutateAsync(request);
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      }
    },
    [
      enabled,
      organizationId,
      debtPositionTypeOrgCode,
      assessmentId,
      pageSize,
      mutateAsync,
      handleError
    ]
  );

  return {
    fetchPaidInstallments,
    data,
    isLoading: isPending,
    isError,
    error,
    isSuccess,
    isPending
  };
};
