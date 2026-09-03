import { FilteredRequest } from '../../models/Filters';
import { ClassificationsEnum } from '../../../generated/core/data-contracts';
import { FilterValues } from '../../models/Filters';
import { euroToCents } from '../../utils/formatters';
import utils from '../../utils';

type GetTreasuredClassificationsQueryParams = Parameters<
  typeof utils.apiClient.bff.getTreasuredClassifications
>[1];

export type ClassificationsFilters = FilterValues;

export type ClassificationsFilteredRequest =
  FilteredRequest<ClassificationsFilters>;

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: ClassificationsFilteredRequest): GetTreasuredClassificationsQueryParams => ({
  label: filters.CLASSIFICATION_TYPE as ClassificationsEnum,
  iuv: filters.IUV,
  iur: filters.IUR,
  iud: filters.IUD,
  iuf: filters.IUF,
  lastClassificationDateTimeFrom: utils.formatters.date.code(
    filters.LAST_CLASSIFICATION_DATE_FROM || undefined
  ),
  lastClassificationDateTimeTo: utils.formatters.date.code(
    filters.LAST_CLASSIFICATION_DATE_TO || undefined
  ),
  regulationDateTimeFrom: utils.formatters.date.code(
    filters.REGULATION_DATE_FROM || undefined
  ),
  regulationDateTimeTo: utils.formatters.date.code(
    filters.REGULATION_DATE_TO || undefined
  ),
  billAmountCents: filters.AMOUNT ? euroToCents(filters.AMOUNT) : undefined,
  billDateTimeFrom: utils.formatters.date.code(
    filters.BILL_DATE_FROM || undefined
  ),
  billDateTimeTo: utils.formatters.date.code(filters.BILL_DATE_TO || undefined),
  paymentDateTimeFrom: utils.formatters.date.code(
    filters.PAYMENT_DATE_FROM || undefined
  ),
  paymentDateTimeTo: utils.formatters.date.code(
    filters.PAYMENT_DATE_TO || undefined
  ),
  payDateTimeFrom: utils.formatters.date.code(
    filters.PAY_DATE_FROM || undefined
  ),
  payDateTimeTo: utils.formatters.date.code(filters.PAY_DATE_TO || undefined),
  regulationUniqueIdentifier: filters.REGULATION_UNIQUE_IDENTIFIER,
  accountRegistryCode: filters.ACCOUNT_REGISTRY_CODE,
  remittanceInformation: filters.REMITTANCE_INFORMATION,
  pspCompanyName: filters.PSP_COMPANY_NAME,
  regionValueDateTimeFrom: utils.formatters.date.code(
    filters.REGION_VALUE_DATE_FROM || undefined
  ),
  regionValueDateTimeTo: utils.formatters.date.code(
    filters.REGION_VALUE_DATE_TO || undefined
  ),
  billCode: filters.BILL_CODE,
  billYear: filters.BILL_FROM?.getFullYear().toString() || undefined,
  page: pagination.page,
  size: pagination.size,
  sort
});
