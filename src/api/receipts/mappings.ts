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

type TelematicReceiptsFiltered = Parameters<
  typeof utils.apiClient.bff.getReceipts
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: TelematicReceiptsFilteredRequest): TelematicReceiptsFiltered => ({
  receiptOrigins: [
    ReceiptOriginType.RECEIPT_PAGOPA,
    ReceiptOriginType.PAYMENTS_REPORTING,
    ReceiptOriginType.RECEIPT_FILE
  ],
  iuv: filters.iuv,
  paymentDateTimeFrom: utils.formatters.date.code(filters?.dateRange?.from),
  paymentDateTimeTo: utils.formatters.date.code(filters?.dateRange?.to),
  debtPositionTypeOrgId: filters.typeOrgId,
  sort,
  page: pagination.page,
  size: pagination.size
});
