import { FilteredRequest } from '../../models/Filters';
import { DebtPositionStatus } from '../../../generated/data-contracts';
import utils from '../../utils';

type GetInstallmentsQueryParams = Parameters<
  typeof utils.apiClient.bff.getInstallments
>[1];

type GetDebtPositionViewsQueryParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionViews
>[1];

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

export type DebtPositionFilteredRequest = FilteredRequest<DebtPositionsFilters>;

export const buildInstallmentsQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionFilteredRequest): GetInstallmentsQueryParams => ({
  dueDateTimeFrom: utils.formatters.date.code(filters?.dateRange?.from),
  dueDateTimeTo: utils.formatters.date.code(filters?.dateRange?.to),
  page: pagination.page,
  size: pagination.size,
  debtPositionTypeOrgId: filters.typeOrgId,
  iuv: filters.iuv,
  fiscalCode: filters.fiscalCode,
  sort
});

export const buildDebtPositionsQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionFilteredRequest): GetDebtPositionViewsQueryParams => ({
  creationDateTimeFrom: utils.formatters.date.code(filters?.dateRange?.from),
  creationDateTimeTo: utils.formatters.date.code(filters?.dateRange?.to),
  debtPositionTypeOrgId: filters.typeOrgId,
  fiscalCode: filters.fiscalCode,
  status: filters.status,
  page: pagination.page,
  size: pagination.size,
  sort
});
