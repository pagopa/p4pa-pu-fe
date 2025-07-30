import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { getAssessments } from '../api/assessments';
import { AssessmentsFilteredRequest } from '../api/assessments/mappings';
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

  const { pagination, handlePageChange } = {
    pagination: { page: 0, size: 10 },
    handlePageChange: () => null
  };

  const {
    state: { organizationId }
  } = useStore();

  const query = getAssessments(organizationId);

  useEffect(() => {
    query.mutate(buildRequestArgs(), {
      onError: handleError
    });
  }, [organizationId, pagination.page, pagination.size, sort]);

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

  const buildRequestArgs = useCallback(
    (
      filterValuesRequest: FilterValues = filterValues
    ): AssessmentsFilteredRequest => {
      return {
        filters: filterValuesRequest,
        pagination,
        sort
      };
    },
    [filterValues, pagination, sort]
  );

  const applyFilters = (filterValues: FilterValues) => {
    query.mutate(buildRequestArgs(filterValues), {
      onError: handleError
    });
    setFilterValues(filterValues);
    handlePageChange(0);
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
    handlePageChange,
    pagination,
    setFilterValues,
    setSort,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    data: query.data
  };
};

export default useAssessmentsSearch;
