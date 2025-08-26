import { ReceiptOriginType } from '../../../generated/data-contracts';
import utils from '../../utils';

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
    utils.formatters.date.code(filters?.dateRange?.from) ??
    new Date(0).toISOString(),
  paymentDateTimeTo:
    utils.formatters.date.code(filters?.dateRange?.to) ??
    new Date().toISOString(),
  page: pagination.page,
  size: pagination.size,
  ...(filters?.typeOrgId && {
    debtPositionTypeOrgId: filters.typeOrgId
  }),
  ...(filters?.iuv && { iuv: filters.iuv }),
  ...(sort.length && { sort }),
  receiptOrigin: ReceiptOriginType.RECEIPT_PAGOPA
});
