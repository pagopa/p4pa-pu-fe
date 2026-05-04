/**
 * Taxonomy fields used in forms for debt type creation.
 * Field names match DebtPositionTypeRequestBody for direct mapping.
 */
export type TaxonomyFields = {
  orgType: string;
  macroArea: string;
  serviceType: string;
  collectingReason: string;
  taxonomyCode: string;
};

/**
 * Taxonomy filters used for search/listing.
 * Supports both naming conventions:
 * - Creation mode: macroArea, serviceType
 * - Search mode: macroAreaCode, serviceTypeCode
 */
export type TaxonomyFilters = {
  orgType?: string;
  // Creation mode field names
  macroArea?: string;
  serviceType?: string;
  // Search mode field names
  macroAreaCode?: string;
  serviceTypeCode?: string;
  // Common fields
  collectingReason?: string;
  taxonomyCode?: string;
};
