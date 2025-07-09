import { AssessmentsRegistryStatus } from '../../../generated/data-contracts';

export type AssessmentRegistryQueryParams = {
  debtPositionTypeOrgCode?: string;
  sectionCode?: string;
  sectionDescription?: string;
  officeCode?: string;
  officeDescription?: string;
  assessmentCode?: string;
  assessmentDescription?: string;
  operatingYear?: string;
  status?: AssessmentsRegistryStatus;
  page?: number;
  size?: number;
  sort?: Array<string>;
};

export type AssessmentsRegistriesFilteredRequest = {
  filters: AssessmentRegistryQueryParams;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: AssessmentsRegistriesFilteredRequest) => ({
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
