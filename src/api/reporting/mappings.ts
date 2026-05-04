import utils from '../../utils';

export type PaymentReportingRowsFilters = {
  daterange?: {
    from: Date;
    to: Date;
  };
  iuv?: string;
};

export type PaymentReportingRowsFilteredRequest = {
  filters: PaymentReportingRowsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type getPaymentReportingRowsQueryParameters = Parameters<
  typeof utils.apiClient.bff.getPaymentsReportingRows
>[2];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: PaymentReportingRowsFilteredRequest): getPaymentReportingRowsQueryParameters => ({
  iuv: filters.iuv,
  payDateTimeFrom: utils.formatters.date.code(filters.daterange?.from),
  payDateTimeTo: utils.formatters.date.code(filters.daterange?.to),
  page: pagination.page,
  size: pagination.size,
  sort
});
