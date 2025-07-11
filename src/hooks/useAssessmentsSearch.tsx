import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
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
    query.mutate(buildRequestArgs(), {
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

  /**
   * Crea gli argomenti per la richiesta API seguendo il pattern architetturale consolidato
   */
  const buildRequestArgs = useCallback(
    (
      filterValuesRequest: FilterValues = filterValues,
      paginationOverride?: { page: number; size: number }
    ): AssessmentsFilteredRequest => {
      const pagination = paginationOverride || paginationParams;

      return {
        filters: filterValuesRequest,
        pagination,
        sort
      };
    },
    [filterValues, paginationParams, sort]
  );

  const applyFilters = (filterValues: FilterValues) => {
    query.mutate(buildRequestArgs(filterValues), {
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
