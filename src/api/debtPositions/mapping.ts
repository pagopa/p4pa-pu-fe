import { DebtPositionStatus } from '../../../generated/data-contracts';
import utils from '../../utils';

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

type InstallmentsQueryParams = Parameters<
  typeof utils.apiClient.bff.getInstallments
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionFilteredRequest): InstallmentsQueryParams => ({
  dueDateTimeFrom: filters?.dateRange?.from?.toISOString(),
  dueDateTimeTo: filters?.dateRange?.to?.toISOString(),
  page: pagination.page,
  size: pagination.size,
  debtPositionTypeOrgId: filters.typeOrgId,
  iuv: filters.iuv,
  fiscalCode: filters.fiscalCode,
  sort
});
