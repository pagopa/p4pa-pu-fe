import { format } from 'date-fns/format';
import { FilterValues } from '../../models/Filters';
import { euroToCents } from '../../utils/formatters';

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
    billDateFrom: format(filters.ACCOUNTING_DATE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.ACCOUNTING_DATE_TO && {
    billDateTo: format(filters.ACCOUNTING_DATE_TO, 'yyyy-MM-dd')
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
    documentYear: format(filters.DOCUMENT_CODE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.IUV && { iuv: filters.IUV }),
  ...(filters.PAYER && {
    pspLastName: filters.PAYER
  }),
  ...(filters.TEMPORARY_CODE && {
    provisionalCode: filters.TEMPORARY_CODE
  }),
  ...(filters?.TEMPORARY_CODE_FROM && {
    provisionalAe: format(filters.TEMPORARY_CODE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.VALUE_DATE_FROM && {
    regionValueDateFrom: format(filters.VALUE_DATE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.VALUE_DATE_TO && {
    regionValueDateTo: format(filters.VALUE_DATE_TO, 'yyyy-MM-dd')
  }),
  ...(filters.REPORT_ID && {
    iuf: filters.REPORT_ID
  }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
