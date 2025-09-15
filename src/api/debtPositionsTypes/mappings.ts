import { DebtPositionTypeRequestBody } from '../../../generated/data-contracts';
import { Step2Data } from '../../routes/DebtTypeCreate/components/Step2Settings';

export type DebtPositionTypeWithCountFilters = {
  description?: string;
};

export type DebtPositionTypeWithCountFilteredRequest = {
  filters: DebtPositionTypeWithCountFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionTypeWithCountFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  description: filters.description,
  sort
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
