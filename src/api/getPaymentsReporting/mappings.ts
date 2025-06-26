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

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ReportingFilteredRequest) => ({
  regulationDateFrom:
    filters?.dateRange?.from?.toISOString().slice(0, 10) ??
    new Date(0).toISOString().slice(0, 10),
  regulationDateTo:
    filters?.dateRange?.to?.toISOString().slice(0, 10) ??
    new Date().toISOString().slice(0, 10),
  page: pagination.page,
  size: pagination.size,
  ...(filters?.regulationUniqueIdentifier && {
    regulationUniqueIdentifier: filters.regulationUniqueIdentifier
  }),
  ...(filters?.iuf && { iuf: filters.iuf }),
  ...(sort.length && { sort })
});
