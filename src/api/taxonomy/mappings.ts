import { TaxonomyFilters } from '../../models/Taxonomy';

export type TaxonomyFilteredRequest = {
  filters: TaxonomyFilters;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: TaxonomyFilteredRequest) => ({
  ...(filters?.orgType && {
    organizationType: filters.orgType
  }),
  ...(filters?.macroAreaCode && {
    macroAreaCode: filters.macroAreaCode
  }),
  ...(filters?.serviceTypeCode && {
    serviceTypeCode: filters.serviceTypeCode
  }),
  ...(filters?.collectingReason && {
    collectionReason: filters.collectingReason
  }),
  ...(sort?.length && { sort }),
  page: pagination.page,
  size: pagination.size
});
