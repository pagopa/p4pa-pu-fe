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
  searchType?: 'IUV' | 'DEBT_POSITION';
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
}: DebtPositionFilteredRequest) => {
  const baseParams = {
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
  };

  if (filters?.dateRange?.from || filters?.dateRange?.to) {
    if (filters.searchType === 'IUV') {
      return {
        ...baseParams,
        ...(filters.dateRange.from && {
          dueDateTimeFrom: filters.dateRange.from.toISOString()
        }),
        ...(filters.dateRange.to && {
          dueDateTimeTo: filters.dateRange.to.toISOString()
        })
      };
    } else {
      return {
        ...baseParams,
        ...(filters.dateRange.from && {
          creationDateFrom: filters.dateRange.from.toISOString()
        }),
        ...(filters.dateRange.to && {
          creationDateTo: filters.dateRange.to.toISOString()
        })
      };
    }
  }

  return baseParams;
};
