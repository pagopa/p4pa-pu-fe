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

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: PaymentReportingRowsFilteredRequest) => ({
  ...(filters?.daterange?.from && {
    payDateFrom: new Date(filters.daterange.from.setHours(0, 0, 0, 0))
      .toISOString()
      .split('T')[0]
  }),
  ...(filters?.daterange?.to && {
    payDateTo: new Date(filters.daterange.to.setHours(23, 59, 59, 999))
      .toISOString()
      .split('T')[0]
  }),
  ...(filters?.iuv && { iuv: filters.iuv }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
