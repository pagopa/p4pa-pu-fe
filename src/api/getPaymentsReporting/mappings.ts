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

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ReportingFilteredRequest) => ({
  regulationDateFrom:
    utils.formatters.date.code(filters?.dateRange?.from) ??
    utils.formatters.date.code(new Date(0)),
  regulationDateTo:
    utils.formatters.date.code(filters?.dateRange?.to) ??
    utils.formatters.date.code(new Date()),
  page: pagination.page,
  size: pagination.size,
  ...(filters?.regulationUniqueIdentifier && {
    regulationUniqueIdentifier: filters.regulationUniqueIdentifier
  }),
  ...(filters?.iuf && { iuf: filters.iuf }),
  ...(sort.length && { sort })
});
