import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
import { AssessmentsQuery, getAssessments } from '../api/assessments';
import { AssessmentStatus } from '../../generated/apiClient';
import { PageRoutes } from '../routes';

export type UseAssessmentsSearchProps = {
  initialFilters: FilterValues;
  initialPage?: number;
  initialSize?: number;
  totalElements?: number;
};

export const useAssessmentsSearch = ({
  initialFilters,
  initialPage,
  initialSize
}: UseAssessmentsSearchProps) => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] =
    useState<FilterValues>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const { paginationParams, handlePaginationChange, setPaginationParams } =
    usePaginationState({
      initialPage,
      initialSize
    });

  const {
    state: { organizationId }
  } = useStore();

  const query = getAssessments(organizationId);

  useEffect(() => {
    query.mutate(filterToRequest(), {
      onError: handleError
    });
  }, [organizationId, paginationParams.page, paginationParams.size, sort]);

  const handleError = (error: unknown) => {
    console.error('Assessment search error:', error);

    const isAxiosError = (
      err: unknown
    ): err is { response?: { status?: number } } => {
      return typeof err === 'object' && err !== null && 'response' in err;
    };

    const statusCode = isAxiosError(error) ? error.response?.status : undefined;

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      navigate(PageRoutes.RESPONSES_ERROR, {
        state: {
          category: 'assessment-search',
          errorType: '4xx',
          statusCode
        }
      });
    }
  };

  const filterToRequest = useCallback(
    (
      filterValuesRequest: FilterValues = filterValues,
      paginationOverride?: { page: number; size: number }
    ): AssessmentsQuery => {
      const pagination = paginationOverride || paginationParams;

      const apiParams = {
        ...(filterValuesRequest.ASSESSMENT_NAME && {
          assessmentName: filterValuesRequest.ASSESSMENT_NAME
        }),
        ...(filterValuesRequest.DEBT_TYPE &&
          filterValuesRequest.DEBT_TYPE !== 'ALL' && {
            debtPositionTypeOrgCode: filterValuesRequest.DEBT_TYPE
          }),
        ...(filterValuesRequest.ASSESSMENT_STATUS && {
          status: filterValuesRequest.ASSESSMENT_STATUS as AssessmentStatus
        }),
        ...(filterValuesRequest.IUV && {
          iuv: filterValuesRequest.IUV
        }),
        ...(filterValuesRequest.LAST_UPDATE_DATE_FROM && {
          updateDateFrom:
            filterValuesRequest.LAST_UPDATE_DATE_FROM.toISOString()
        }),
        ...(filterValuesRequest.LAST_UPDATE_DATE_TO && {
          updateDateTo: filterValuesRequest.LAST_UPDATE_DATE_TO.toISOString()
        }),
        page: pagination.page,
        size: pagination.size,
        ...(sort.length && { sort })
      };
      return apiParams;
    },
    [filterValues, paginationParams, sort]
  );

  const applyFilters = (filterValues: FilterValues) => {
    query.mutate(filterToRequest(filterValues), {
      onError: handleError
    });
    setFilterValues(filterValues);
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  };

  const executeSearch = (currentFilters?: FilterValues) => {
    const filtersToUse = currentFilters || filterValues;
    applyFilters(filtersToUse);
  };

  return {
    applyFilters,
    executeSearch,
    query,
    filterValues,
    handlePaginationChange,
    paginationParams,
    setFilterValues,
    setSort,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    data: query.data
  };
};

export default useAssessmentsSearch;
