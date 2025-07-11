import { format } from 'date-fns';
import { AssessmentsRegistryStatus } from '../../../generated/data-contracts';
import { FilterValues } from '../../models/Filters';

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
  filters: FilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: AssessmentsRegistriesFilteredRequest) => ({
  ...(filters.OFFICE_CODE && { officeCode: filters.OFFICE_CODE }),
  ...(filters.OFFICE_DESCRIPTION && {
    officeDescription: filters.OFFICE_DESCRIPTION
  }),
  ...(filters.ASSESSMENT_CODE && { assessmentCode: filters.ASSESSMENT_CODE }),
  ...(filters.ASSESSMENT_DESCRIPTION && {
    assessmentDescription: filters.ASSESSMENT_DESCRIPTION
  }),
  ...(filters.OPERATING_YEAR && {
    operatingYear: format(filters.OPERATING_YEAR, 'yyyy')
  }),
  ...(filters.STATUS && {
    status: filters.STATUS as AssessmentsRegistryStatus
  }),
  ...(filters.SECTION_CODE && { sectionCode: filters.SECTION_CODE }),
  ...(filters.SECTION_DESCRIPTION && {
    sectionDescription: filters.SECTION_DESCRIPTION
  }),
  ...(filters.DEBT_POSITION_TYPE_ORG_CODE && {
    debtPositionTypeOrgCode: filters.DEBT_POSITION_TYPE_ORG_CODE
  }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
