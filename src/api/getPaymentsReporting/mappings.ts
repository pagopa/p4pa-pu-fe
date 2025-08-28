import utils from '../../utils';

export type ReportingFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  regulationUniqueIdentifier?: string;
  organizationId?: number;
  iuf?: string;
};

export type ReportingFilteredRequest = {
  filters: ReportingFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type getPaymentReportingQueryParameters = Parameters<
  typeof utils.apiClient.bff.getPaymentsReporting
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ReportingFilteredRequest): getPaymentReportingQueryParameters => ({
  iuf: filters.iuf,
  regulationUniqueIdentifier: filters.regulationUniqueIdentifier,
  regulationDateTimeFrom: utils.formatters.date.code(filters?.dateRange?.from),
  regulationDateTimeTo: utils.formatters.date.code(filters?.dateRange?.to),
  page: pagination.page,
  size: pagination.size,
  sort
});
