export type TaxonomyFields = {
  orgType: string;
  macroAreaCode: string;
  serviceTypeCode: string;
  collectingReason: string;
  taxonomyCode: string;
};

export type TaxonomyFilters = Partial<TaxonomyFields> & {
  orgType: string;
};
