import { format } from 'date-fns';
import {
  AssessmentsRegistryStatus,
  AssessmentStatus
} from '../../../generated/data-contracts';
import { FilteredRequest, FilterValues } from '../../models/Filters';
import utils from '../../utils';

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

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<FilterValues>) => ({
  officeCode: filters.OFFICE_CODE,
  officeDescription: filters.OFFICE_DESCRIPTION,
  assessmentCode: filters.ASSESSMENT_CODE,
  assessmentDescription: filters.ASSESSMENT_DESCRIPTION,
  operatingYear: format(filters.OPERATING_YEAR, 'yyyy'),
  status: filters.STATUS as AssessmentsRegistryStatus,
  sectionCode: filters.SECTION_CODE,
  sectionDescription: filters.SECTION_DESCRIPTION,
  debtPositionTypeOrgCode: filters.DEBT_POSITION_TYPE_ORG_CODE,
  page: pagination.page,
  size: pagination.size,
  sort
});

export const buildAssessmentsQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<FilterValues>) => ({
  assessmentName: filters.ASSESSMENT_NAME,
  debtPositionTypeOrgCode: filters.DEBT_TYPE &&
    filters.DEBT_TYPE !== 'ALL' ? filters.DEBT_TYPE : undefined,
  operatingYear: filters.OPERATING_YEAR,
  status: filters.ASSESSMENT_STATUS as AssessmentStatus,
  iuv: filters.IUV,
  updateDateFrom: utils.formatters.date.code(filters.LAST_UPDATE_DATE_FROM || undefined),
  updateDateTo: utils.formatters.date.code(filters.LAST_UPDATE_DATE_TO || undefined),
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

export const buildAssessmentDetailQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<AssessmentDetailFilters>) => ({
  iuv: filters.iuv,
  updateDateTimeFrom: utils.formatters.date.code(new Date(
    filters?.update?.from?.setHours(0, 0, 0, 0) || 0
  )),
  updateDateTimeTo: utils.formatters.date.code(new Date(
    filters?.update?.to?.setHours(23, 59, 59, 999)  || 0
  )),
  paymentDateTimeFrom: utils.formatters.date.code(new Date(
    filters?.outcome?.from?.setHours(0, 0, 0, 0) || 0
  )),
  paymentDateTimeTo: utils.formatters.date.code(new Date(
    filters?.outcome?.to?.setHours(23, 59, 59, 999) || 0
  )),
  page: pagination.page,
  size: pagination.size,
  sort
});
