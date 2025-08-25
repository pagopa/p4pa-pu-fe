import { formatISO } from 'date-fns';
import { ClassificationsEnum } from '../../../generated/data-contracts';
import { FilterValues } from '../../models/Filters';
import { euroToCents } from '../../utils/formatters';
import utils from '../../utils';

export type ClassificationsFilteredRequest = {
  filters: FilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type ClassificationsQueryParams = Parameters<
  typeof utils.apiClient.bff.getTreasuredClassifications
>[1];

/** this is a tempory function that will be removed with the task P4ADEV-3617 */
const temporyFormatDateTimeFunction = (date?: Date | null) => {
  if (date === null || !date) return;
  return formatISO(date);
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ClassificationsFilteredRequest): ClassificationsQueryParams => ({
  ...(filters.CLASSIFICATION_TYPE && {
    label: filters.CLASSIFICATION_TYPE as ClassificationsEnum
  }),
  ...(filters.IUV && { iuv: filters.IUV }),
  ...(filters.IUR && { iur: filters.IUR }),
  ...(filters.IUD && { iud: filters.IUD }),
  ...(filters.IUF && { iuf: filters.IUF }),
  ...(filters.LAST_CLASSIFICATION_DATE_FROM && {
    lastClassificationDateTimeFrom: temporyFormatDateTimeFunction(
      filters.LAST_CLASSIFICATION_DATE_FROM
    )
  }),
  ...(filters.LAST_CLASSIFICATION_DATE_TO && {
    lastClassificationDateTimeTo: temporyFormatDateTimeFunction(
      filters.LAST_CLASSIFICATION_DATE_TO
    )
  }),
  ...(filters.REGULATION_DATE_FROM && {
    regulationDateTimeFrom: temporyFormatDateTimeFunction(
      filters.REGULATION_DATE_FROM
    )
  }),
  ...(filters.REGULATION_DATE_TO && {
    regulationDateTimeTo: temporyFormatDateTimeFunction(
      filters.REGULATION_DATE_TO
    )
  }),
  ...(filters.AMOUNT && {
    billAmountCents: euroToCents(filters.AMOUNT)
  }),
  ...(filters.BILL_DATE_FROM && {
    billDateTimeFrom: temporyFormatDateTimeFunction(filters.BILL_DATE_FROM)
  }),
  ...(filters.BILL_DATE_TO && {
    billDateTimeTo: temporyFormatDateTimeFunction(filters.BILL_DATE_TO)
  }),
  ...(filters.PAYMENT_DATE_FROM && {
    paymentDateTimeFrom: temporyFormatDateTimeFunction(
      filters.PAYMENT_DATE_FROM
    )
  }),
  ...(filters.PAYMENT_DATE_TO && {
    paymentDateTimeTo: temporyFormatDateTimeFunction(filters.PAYMENT_DATE_TO)
  }),
  ...(filters.PAY_DATE_FROM && {
    payDateTimeFrom: temporyFormatDateTimeFunction(filters.PAY_DATE_FROM)
  }),
  ...(filters.PAY_DATE_TO && {
    payDateTimeTo: temporyFormatDateTimeFunction(filters.PAY_DATE_TO)
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
    regionValueDateTimeFrom: temporyFormatDateTimeFunction(
      filters.REGION_VALUE_DATE_FROM
    )
  }),
  ...(filters.REGION_VALUE_DATE_TO && {
    regionValueDateTimeTo: temporyFormatDateTimeFunction(
      filters.REGION_VALUE_DATE_TO
    )
  }),
  page: pagination.page,
  size: pagination.size,
  sort
});
