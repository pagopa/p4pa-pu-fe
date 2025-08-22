import { format } from 'date-fns/format';
import { ClassificationsEnum } from '../../../generated/data-contracts';
import { FilterValues } from '../../models/Filters';
import { euroToCents } from '../../utils/formatters';

export type ClassificationsFilteredRequest = {
  filters: FilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ClassificationsFilteredRequest) => ({
  ...(filters.CLASSIFICATION_TYPE && {
    label: filters.CLASSIFICATION_TYPE as ClassificationsEnum
  }),
  ...(filters.IUV && { iuv: filters.IUV }),
  ...(filters.IUR && { iur: filters.IUR }),
  ...(filters.IUD && { iud: filters.IUD }),
  ...(filters.IUF && { iuf: filters.IUF }),
  ...(filters.LAST_CLASSIFICATION_DATE_FROM && {
    lastClassificationDateFrom: format(
      filters.LAST_CLASSIFICATION_DATE_FROM,
      'yyyy-MM-dd'
    )
  }),
  ...(filters.LAST_CLASSIFICATION_DATE_TO && {
    lastClassificationDateTo: format(
      filters.LAST_CLASSIFICATION_DATE_TO,
      'yyyy-MM-dd'
    )
  }),
  ...(filters.REGULATION_DATE_FROM && {
    regulationDateFrom: format(filters.REGULATION_DATE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.REGULATION_DATE_TO && {
    regulationDateTo: format(filters.REGULATION_DATE_TO, 'yyyy-MM-dd')
  }),
  ...(filters.AMOUNT && {
    billAmountCents: euroToCents(filters.AMOUNT)
  }),
  ...(filters.BILL_DATE_FROM && {
    billDateFrom: format(filters.BILL_DATE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.BILL_DATE_TO && {
    billDateTo: format(filters.BILL_DATE_TO, 'yyyy-MM-dd')
  }),
  ...(filters.PAYMENT_DATE_FROM && {
    paymentDateTimeFrom: filters.PAYMENT_DATE_FROM.toISOString()
  }),
  ...(filters.PAYMENT_DATE_TO && {
    paymentDateTimeTo: filters.PAYMENT_DATE_TO.toISOString()
  }),
  ...(filters.PAY_DATE_FROM && {
    payDateFrom: format(filters.PAY_DATE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.PAY_DATE_TO && {
    payDateTo: format(filters.PAY_DATE_TO, 'yyyy-MM-dd')
  }),
  ...(filters.REGULATION_UNIQUE_IDENTIFIER && {
    regulationUniqueIdentifier: filters.REGULATION_UNIQUE_IDENTIFIER
  }),
  ...(filters.ACCOUNT_REGISTRY_CODE && {
    accountRegistryCode: filters.ACCOUNT_REGISTRY_CODE
  }),
  ...(filters.REMITTANCE_INFORMATION && {
    remittanceInformation: filters.REMITTANCE_INFORMATION
  }),
  ...(filters.PSP_COMPANY_NAME && {
    pspCompanyName: filters.PSP_COMPANY_NAME
  }),
  ...(filters.REGION_VALUE_DATE_FROM && {
    regionValueDateFrom: format(filters.REGION_VALUE_DATE_FROM, 'yyyy-MM-dd')
  }),
  ...(filters.REGION_VALUE_DATE_TO && {
    regionValueDateTo: format(filters.REGION_VALUE_DATE_TO, 'yyyy-MM-dd')
  }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
