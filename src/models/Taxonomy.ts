// Taxonomy fields for form - all required
export type TaxonomyFields = {
  orgType: string;
  macroAreaCode: string;
  serviceTypeCode: string;
  collectingReason: string;
  taxonomyCode: string;
};

// Taxonomy filters for search - all optional
export type TaxonomyFilters = Partial<TaxonomyFields>;
