import { FilteredRequest } from '../../models/Filters';
import { DebtPositionTypeRequestBody } from '../../../generated/data-contracts';
import { Step2Data } from '../../routes/DebtTypeCreate/components/Step2Settings';
import utils from '../../utils';

type GetDebtPositionTypeWithCountQueryParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionTypeWithCount
>[1];

export type DebtPositionTypeWithCountFilters = Pick<
  NonNullable<GetDebtPositionTypeWithCountQueryParams>,
  'description'
>;

export type DebtPositionTypeWithCountFilteredRequest =
  FilteredRequest<DebtPositionTypeWithCountFilters>;

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionTypeWithCountFilteredRequest): GetDebtPositionTypeWithCountQueryParams => ({
  page: pagination.page,
  size: pagination.size,
  ...(filters?.description && {
    description: filters.description
  }),
  ...(sort?.length && { sort })
});

export const buildQueryPostParams = (
  step2Data: Step2Data
): DebtPositionTypeRequestBody => ({
  debtPositionTypeId: step2Data.debtPositionTypeId,
  code: step2Data.code || '',
  description: step2Data.description || '',
  orgType: step2Data.orgType || '',
  macroArea: step2Data.macroArea || '',
  serviceType: step2Data.serviceType || '',
  collectingReason: step2Data.collectingReason || '',
  taxonomyCode: step2Data.taxonomyCode || '',
  flagAnonymousFiscalCode: step2Data.flagAnonymousFiscalCode,
  flagMandatoryDueDate: step2Data.flagMandatoryDueDate,
  flagNotifyIo: step2Data.flagNotifyIo,
  ioTemplateMessage: step2Data.ioTemplateMessage,
  ioTemplateSubject: step2Data.ioTemplateSubject
});
