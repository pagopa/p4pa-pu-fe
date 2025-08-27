import { FilterValues } from '../../models/Filters';
import utils from '../../utils';

export type TreasuriesFilteredRequest = {
  filters: FilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type getTreasuriesQueryParameters = Parameters<
  typeof utils.apiClient.bff.getTreasuries
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: TreasuriesFilteredRequest): getTreasuriesQueryParameters => ({
  iuv: filters.IUV,
  iuf: filters.REPORT_ID,
  billAmountCents: filters.AMOUNT
    ? utils.formatters.euroToCents(filters.AMOUNT)
    : undefined,
  billDateTimeFrom: utils.formatters.date.code(filters.ACCOUNTING_DATE_FROM),
  billDateTimeTo: utils.formatters.date.code(filters.ACCOUNTING_DATE_TO),
  provisionalCode: filters.TEMPORARY_CODE,
  provisionalAe: utils.formatters.date.code(filters.TEMPORARY_CODE_FROM),
  billCode: filters.BILL_CODE,
  billYear: filters.BILL_FROM?.getFullYear().toString() || undefined,
  pspLastName: filters.PAYER,
  regionValueDateTimeFrom: utils.formatters.date.code(filters.VALUE_DATE_FROM),
  regionValueDateTimeTo: utils.formatters.date.code(filters.VALUE_DATE_TO),
  documentYear:
    filters.DOCUMENT_CODE_FROM?.getFullYear().toString() || undefined,
  documentCode: filters.DOCUMENT_CODE,
  page: pagination.page,
  size: pagination.size,
  sort
});
