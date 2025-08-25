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
  label: filters.CLASSIFICATION_TYPE as ClassificationsEnum,
  iuv: filters.IUV,
  iur: filters.IUR,
  iud: filters.IUD,
  iuf: filters.IUF,
  lastClassificationDateTimeFrom: temporyFormatDateTimeFunction(
    filters.LAST_CLASSIFICATION_DATE_FROM
  ),
  lastClassificationDateTimeTo: temporyFormatDateTimeFunction(
    filters.LAST_CLASSIFICATION_DATE_TO
  ),
  regulationDateTimeFrom: temporyFormatDateTimeFunction(
    filters.REGULATION_DATE_FROM
  ),
  regulationDateTimeTo: temporyFormatDateTimeFunction(
    filters.REGULATION_DATE_TO
  ),
  billAmountCents: filters.AMOUNT ? euroToCents(filters.AMOUNT) : undefined,
  billDateTimeFrom: temporyFormatDateTimeFunction(filters.BILL_DATE_FROM),
  billDateTimeTo: temporyFormatDateTimeFunction(filters.BILL_DATE_TO),
  paymentDateTimeFrom: temporyFormatDateTimeFunction(filters.PAYMENT_DATE_FROM),
  paymentDateTimeTo: temporyFormatDateTimeFunction(filters.PAYMENT_DATE_TO),
  payDateTimeFrom: temporyFormatDateTimeFunction(filters.PAY_DATE_FROM),
  payDateTimeTo: temporyFormatDateTimeFunction(filters.PAY_DATE_TO),
  regulationUniqueIdentifier: filters.REGULATION_UNIQUE_IDENTIFIER,
  accountRegistryCode: filters.ACCOUNT_REGISTRY_CODE,
  remittanceInformation: filters.REMITTANCE_INFORMATION,
  pspCompanyName: filters.PSP_COMPANY_NAME,
  regionValueDateTimeFrom: temporyFormatDateTimeFunction(
    filters.REGION_VALUE_DATE_FROM
  ),
  regionValueDateTimeTo: temporyFormatDateTimeFunction(
    filters.REGION_VALUE_DATE_TO
  ),
  page: pagination.page,
  size: pagination.size,
  sort
});
