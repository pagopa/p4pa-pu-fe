import { DebtPositionStatus } from '../../../generated/data-contracts';

export type DebtPositionsFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: DebtPositionStatus;
  fiscalCode?: string;
  iuv?: string;
  typeOrgId?: number;
};

export type DebtPositionFilteredRequest = {
  filters: DebtPositionsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionFilteredRequest) => ({
  dueDateFrom:
    filters?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
  dueDateTo: filters?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
  creationDateFrom:
    filters?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
  creationDateTo:
    filters?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
  page: pagination.page,
  size: pagination.size,
  ...(filters?.typeOrgId && {
    debtPositionTypeOrgId: filters.typeOrgId
  }),
  ...(filters?.iuv && { iuv: filters.iuv }),
  ...(filters?.fiscalCode && {
    fiscalCode: filters.fiscalCode
  }),
  ...(filters?.status && { status: filters.status }),
  ...(sort.length && { sort })
});
