import { FilteredRequest } from '../../models/Filters';
import utils from '../../utils';

type GetDebtPositionTypeOrgOperatorsQueryParams = Parameters<
  typeof utils.apiClient.bff.getDebtPositionTypeOrgOperators
>[1];

export type DebtPositionTypeOrgOperatorFilters = Pick<
  NonNullable<GetDebtPositionTypeOrgOperatorsQueryParams>,
  'debtPositionTypeOrgId'
>;

export type DebtPositionTypeOrgOperatorFilteredRequest =
  FilteredRequest<DebtPositionTypeOrgOperatorFilters>;

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: DebtPositionTypeOrgOperatorFilteredRequest): GetDebtPositionTypeOrgOperatorsQueryParams => ({
  ...(filters.debtPositionTypeOrgId && {
    debtPositionTypeOrgId: filters.debtPositionTypeOrgId
  }),
  page: pagination.page,
  size: pagination.size,
  ...(sort?.length && { sort })
});
