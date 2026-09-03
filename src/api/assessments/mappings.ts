import { format } from 'date-fns';
import {
  AssessmentsRegistryStatus,
  AssessmentStatus
} from '../../../generated/core/data-contracts';
import { FilteredRequest, FilterValues } from '../../models/Filters';
import utils from '../../utils';

type getAssessmentsRegistriesQueryParameters = Parameters<
  typeof utils.apiClient.bff.getAssessmentsRegistries
>[1];

export const buildAssessmentsRegistriesQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<FilterValues>): getAssessmentsRegistriesQueryParameters => ({
  debtPositionTypeOrgCode: filters.DEBT_POSITION_TYPE_ORG_CODE,
  sectionCode: filters.SECTION_CODE,
  sectionDescription: filters.SECTION_DESCRIPTION,
  officeCode: filters.OFFICE_CODE,
  officeDescription: filters.OFFICE_DESCRIPTION,
  assessmentCode: filters.ASSESSMENT_CODE,
  assessmentDescription: filters.ASSESSMENT_DESCRIPTION,
  operatingYear: filters.OPERATING_YEAR
    ? format(filters.OPERATING_YEAR, 'yyyy')
    : undefined,
  status: filters.STATUS as AssessmentsRegistryStatus,
  page: pagination.page,
  size: pagination.size,
  sort
});

type getAssessmentsQueryParameters = Parameters<
  typeof utils.apiClient.bff.getPagedAssessmentsExtendedDto
>[1];

export const buildAssessmentsQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<FilterValues>): getAssessmentsQueryParameters => ({
  assessmentName: filters.ASSESSMENT_NAME,
  updateDateTimeFrom: utils.formatters.date.code(filters.LAST_UPDATE_DATE_FROM),
  updateDateTimeTo: utils.formatters.date.code(filters.LAST_UPDATE_DATE_TO),
  iuv: filters.IUV,
  debtPositionTypeOrgCode:
    filters.DEBT_TYPE && filters.DEBT_TYPE !== 'ALL'
      ? filters.DEBT_TYPE
      : undefined,
  status: filters.ASSESSMENT_STATUS as AssessmentStatus,
  page: pagination.page,
  size: pagination.size,
  sort
});

export type AssessmentDetailFilters = {
  iuv?: string;
  update?: {
    from?: Date;
    to?: Date;
  };
  outcome?: {
    from?: Date;
    to?: Date;
  };
};

type getAssessmentsDetailQueryParameters = Parameters<
  typeof utils.apiClient.bff.getPagedAssessmentsDetails
>[2];

export const buildAssessmentDetailQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<AssessmentDetailFilters>): getAssessmentsDetailQueryParameters => ({
  iuv: filters.iuv,
  updateDateTimeFrom: filters?.update?.from
    ? utils.formatters.date.code(
        new Date(filters.update.from.setHours(0, 0, 0, 0))
      )
    : undefined,
  updateDateTimeTo: filters?.update?.to
    ? utils.formatters.date.code(
        new Date(filters?.update?.to?.setHours(23, 59, 59, 999))
      )
    : undefined,
  paymentDateTimeFrom: filters?.outcome?.from
    ? utils.formatters.date.code(
        new Date(filters?.outcome?.from?.setHours(0, 0, 0, 0))
      )
    : undefined,
  paymentDateTimeTo: filters?.outcome?.to
    ? utils.formatters.date.code(
        new Date(filters?.outcome?.to?.setHours(23, 59, 59, 999))
      )
    : undefined,
  page: pagination.page,
  size: pagination.size,
  sort
});
