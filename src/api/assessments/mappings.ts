import { format } from 'date-fns';
import {
  AssessmentsRegistryStatus,
  AssessmentStatus
} from '../../../generated/data-contracts';
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

export type AssessmentsFilteredRequest = {
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

export const buildAssessmentsQueryParams = ({
  filters,
  pagination,
  sort
}: AssessmentsFilteredRequest) => ({
  ...(filters.ASSESSMENT_NAME && {
    assessmentName: filters.ASSESSMENT_NAME
  }),
  ...(filters.DEBT_TYPE &&
    filters.DEBT_TYPE !== 'ALL' && {
      debtPositionTypeOrgCode: filters.DEBT_TYPE
    }),
  ...(filters.ASSESSMENT_STATUS && {
    status: filters.ASSESSMENT_STATUS as AssessmentStatus
  }),
  ...(filters.IUV && {
    iuv: filters.IUV
  }),
  ...(filters.LAST_UPDATE_DATE_FROM && {
    updateDateFrom: filters.LAST_UPDATE_DATE_FROM.toISOString()
  }),
  ...(filters.LAST_UPDATE_DATE_TO && {
    updateDateTo: filters.LAST_UPDATE_DATE_TO.toISOString()
  }),
  page: pagination.page,
  size: pagination.size,
  ...(sort.length && { sort })
});
