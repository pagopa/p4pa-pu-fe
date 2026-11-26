import type {
  ClassificationPaidInstallmentsView,
  PagedClassificationPaidInstallmentsView
} from '../../../../generated/core/data-contracts';
import { subDays } from 'date-fns';
import {
  date as dateFormatter,
  toStartOfDay,
  toEndOfDay
} from '../../../utils/formatters';

export type PaidInstallmentDTO = ClassificationPaidInstallmentsView;
export type PagedPaidInstallmentsDTO = PagedClassificationPaidInstallmentsView;
export type PaymentsUIFilters = {
  iuv?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  updateDateFrom?: Date | null;
  updateDateTo?: Date | null;
};

export type PaidInstallmentsFilters = {
  iuv?: string;
  paymentDateTimeFrom?: string;
  paymentDateTimeTo?: string;
  updateDateFrom?: string;
  updateDateTo?: string;
};

export type PaidInstallmentsFilteredRequest = {
  debtPositionTypeOrgCode: string;
  assessmentId?: number;
  filters?: PaidInstallmentsFilters;
  pagination: {
    page: number;
    size: number;
  };
  sort?: Array<string>;
};

export const buildQueryParams = ({
  debtPositionTypeOrgCode,
  assessmentId,
  filters,
  pagination,
  sort
}: PaidInstallmentsFilteredRequest) => ({
  debtPositionTypeOrgCode,
  ...(assessmentId && { assessmentId }),
  ...(filters?.iuv && { iuv: filters.iuv }),
  ...(filters?.paymentDateTimeFrom && {
    paymentDateTimeFrom: filters.paymentDateTimeFrom
  }),
  ...(filters?.paymentDateTimeTo && {
    paymentDateTimeTo: filters.paymentDateTimeTo
  }),
  ...(filters?.updateDateFrom && { updateDateFrom: filters.updateDateFrom }),
  ...(filters?.updateDateTo && { updateDateTo: filters.updateDateTo }),
  page: pagination.page,
  size: pagination.size,
  ...(sort?.length && { sort })
});

export const convertFiltersToAPI = (
  uiFilters: PaymentsUIFilters
): PaidInstallmentsFilters => {
  const apiFilters: PaidInstallmentsFilters = {};

  if (uiFilters.iuv?.trim()) {
    apiFilters.iuv = uiFilters.iuv.trim();
  }

  if (uiFilters.dateFrom && uiFilters.dateTo) {
    apiFilters.paymentDateTimeFrom = dateFormatter.code(uiFilters.dateFrom);
    apiFilters.paymentDateTimeTo = dateFormatter.code(uiFilters.dateTo);
  }

  if (uiFilters.updateDateFrom && uiFilters.updateDateTo) {
    apiFilters.updateDateFrom = dateFormatter.code(uiFilters.updateDateFrom);
    apiFilters.updateDateTo = dateFormatter.code(uiFilters.updateDateTo);
  }

  if (!apiFilters.paymentDateTimeFrom && !apiFilters.paymentDateTimeTo) {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const from = toStartOfDay(thirtyDaysAgo);
    const to = toEndOfDay(today);

    apiFilters.paymentDateTimeFrom = dateFormatter.code(from);
    apiFilters.paymentDateTimeTo = dateFormatter.code(to);
  }

  return apiFilters;
};
