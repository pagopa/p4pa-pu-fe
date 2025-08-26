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
  sort
});

export const buildAssessmentsQueryParams = ({
  filters,
  pagination,
  sort
}: FilteredRequest<FilterValues>) => ({
  assessmentName: filters.ASSESSMENT_NAME,
  debtPositionTypeOrgCode:
    filters.DEBT_TYPE && filters.DEBT_TYPE !== 'ALL'
      ? filters.DEBT_TYPE
      : undefined,
  operatingYear: filters.OPERATING_YEAR,
  status: filters.ASSESSMENT_STATUS as AssessmentStatus,
  iuv: filters.IUV,
  updateDateFrom: utils.formatters.date.code(
    filters.LAST_UPDATE_DATE_FROM || undefined
  ),
  updateDateTo: utils.formatters.date.code(
    filters.LAST_UPDATE_DATE_TO || undefined
  ),
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
}: FilteredRequest<AssessmentDetailFilters>) => {
  const params: Record<string, unknown> = {
    page: pagination.page,
    size: pagination.size,
    sort
  };

  if (filters.iuv) {
    params.iuv = filters.iuv;
  }

  if (filters?.update?.from) {
    params.updateDateTimeFrom = utils.formatters.date.code(
      new Date(filters.update.from.setHours(0, 0, 0, 0))
    );
  }

  if (filters?.update?.to) {
    params.updateDateTimeTo = utils.formatters.date.code(
      new Date(filters.update.to.setHours(23, 59, 59, 999))
    );
  }

  if (filters?.outcome?.from) {
    params.paymentDateTimeFrom = utils.formatters.date.code(
      new Date(filters.outcome.from.setHours(0, 0, 0, 0))
    );
  }

  if (filters?.outcome?.to) {
    params.paymentDateTimeTo = utils.formatters.date.code(
      new Date(filters.outcome.to.setHours(23, 59, 59, 999))
    );
  }

  return params;
};
