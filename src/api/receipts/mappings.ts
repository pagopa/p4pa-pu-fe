import { ReceiptOriginType } from '../../../generated/data-contracts';

export type TelematicReceiptsFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  iuv?: string;
  typeOrgId?: number;
};

export type TelematicReceiptsFilteredRequest = {
  filters: TelematicReceiptsFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: TelematicReceiptsFilteredRequest) => ({
  paymentDateTimeFrom:
    filters?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
  paymentDateTimeTo:
    filters?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
  page: pagination.page,
  size: pagination.size,
  ...(filters?.typeOrgId && {
    debtPositionTypeOrgId: filters.typeOrgId
  }),
  ...(filters?.iuv && { iuv: filters.iuv }),
  ...(sort.length && { sort }),
  receiptOrigin: ReceiptOriginType.RECEIPT_PAGOPA
});
