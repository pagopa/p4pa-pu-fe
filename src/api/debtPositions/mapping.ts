import { DebtPositionFilteredRequest } from '.';

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
