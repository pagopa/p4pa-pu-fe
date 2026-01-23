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
  // Support both field naming conventions:
  // - macroAreaCode (search mode)
  // - macroArea (creation mode)
  ...((filters?.macroAreaCode || filters?.macroArea) && {
    macroAreaCode: filters.macroAreaCode || filters.macroArea
  }),
  // Support both field naming conventions:
  // - serviceTypeCode (search mode)
  // - serviceType (creation mode)
  ...((filters?.serviceTypeCode || filters?.serviceType) && {
    serviceTypeCode: filters.serviceTypeCode || filters.serviceType
  }),
  ...(filters?.collectingReason && {
    collectionReason: filters.collectingReason
  }),
  ...(filters?.taxonomyCode && {
    taxonomyCode: filters.taxonomyCode
  }),
  ...(sort?.length && { sort }),
  page: pagination.page,
  size: pagination.size
});
