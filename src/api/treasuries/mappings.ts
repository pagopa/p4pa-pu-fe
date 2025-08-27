import { FilterValues } from '../../models/Filters';
import { euroToCents } from '../../utils/formatters';
import utils from '../../utils';

export type TreasuriesFilteredRequest = {
  filters: FilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: TreasuriesFilteredRequest) => ({
  ...(filters.ACCOUNTING_DATE_FROM && {
    billDateFrom: utils.formatters.date.code(filters.ACCOUNTING_DATE_FROM)
  }),
  ...(filters.ACCOUNTING_DATE_TO && {
    billDateTo: utils.formatters.date.code(filters.ACCOUNTING_DATE_TO)
  }),
  ...(filters.AMOUNT && {
    billAmountCents: euroToCents(filters.AMOUNT)
  }),
  ...(filters.BILL_CODE && {
    billCode: filters.BILL_CODE
  }),
  ...(filters.BILL_FROM && {
    billYear: filters.BILL_FROM.getFullYear().toString()
  }),
  ...(filters.DOCUMENT_CODE && {
    documentCode: filters.DOCUMENT_CODE
  }),
  ...(filters.DOCUMENT_CODE_FROM && {
    documentYear: utils.formatters.date.code(filters.DOCUMENT_CODE_FROM)
  }),
  ...(filters.IUV && { iuv: filters.IUV }),
  ...(filters.PAYER && {
    pspLastName: filters.PAYER
  }),
  ...(filters.TEMPORARY_CODE && {
    provisionalCode: filters.TEMPORARY_CODE
  }),
  ...(filters?.TEMPORARY_CODE_FROM && {
    provisionalAe: utils.formatters.date.code(filters.TEMPORARY_CODE_FROM)
  }),
  ...(filters.VALUE_DATE_FROM && {
    regionValueDateFrom: utils.formatters.date.code(filters.VALUE_DATE_FROM)
  }),
  ...(filters.VALUE_DATE_TO && {
    regionValueDateTo: utils.formatters.date.code(filters.VALUE_DATE_TO)
  }),
  ...(filters.REPORT_ID && {
    iuf: filters.REPORT_ID
  }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
