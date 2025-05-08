import { useState, useRef, useCallback } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { PaginationParams } from '../models/Filters';

export type FilterValue = string | number | boolean | Array<string>;
export type FilterParams = Record<string, FilterValue>;

type UseDebtTypesCreatedFiltersProps = {
  initialFilters?: FilterParams;
};

export function useDebtTypesCreatedFilters({
  initialFilters = {}
}: UseDebtTypesCreatedFiltersProps = {}) {
  const defaultFilters: FilterParams = {
    page: 0,
    size: 10
  };

  const completeInitialFilters = {
    ...defaultFilters,
    ...initialFilters
  };

  const [appliedFilters, setAppliedFilters] = useState<FilterParams>(
    completeInitialFilters
  );

  const [draftFilters, setDraftFilters] = useState<FilterParams>(
    completeInitialFilters
  );

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const initialFetchDone = useRef(false);

  const removeEmptyParams = useCallback(
    (filters: Record<string, unknown>): FilterParams => {
      return Object.entries(filters).reduce((acc, [key, value]) => {
        if (
          value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
        ) {
          return acc;
        }

        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          (Array.isArray(value) &&
            value.every((item) => typeof item === 'string'))
        ) {
          return { ...acc, [key]: value as FilterValue };
        }

        return acc;
      }, {} as FilterParams);
    },
    []
  );

  const isFilterActive = useCallback(() => {
    return Object.entries(draftFilters).some(([key, value]) => {
      if (key === 'page' || key === 'size' || key === 'sort') return false;

      if (typeof value === 'string') {
        return value !== '';
      }

      return false;
    });
  }, [draftFilters]);

  const updateDraftFilters = useCallback((newFilters: FilterParams) => {
    setDraftFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const mapSortModelToApiSort = useCallback(
    (model: GridSortModel): Array<string> => {
      return model.map(
        (sort) => `${sort.field},${sort.sort === 'asc' ? 'asc' : 'desc'}`
      );
    },
    []
  );

  const applyFilters = useCallback(() => {
    const updatedFiltersWithPage = { ...draftFilters, page: 0 };

    const updatedFilters: Record<string, unknown> = {
      ...updatedFiltersWithPage
    };

    const cleanFilters = removeEmptyParams(updatedFilters);

    setAppliedFilters(removeEmptyParams(updatedFilters));

    initialFetchDone.current = true;

    return cleanFilters;
  }, [draftFilters, removeEmptyParams]);

  const updatePagination = useCallback(
    ({ page, size }: PaginationParams) => {
      const updatedFilters: Record<string, unknown> = {
        ...appliedFilters,
        page,
        size
      };

      const cleanFilters = removeEmptyParams(updatedFilters);

      setAppliedFilters(removeEmptyParams(updatedFilters));
      setDraftFilters((prev) => ({ ...prev, page, size }));

      return cleanFilters;
    },
    [appliedFilters, removeEmptyParams]
  );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      const apiSort = mapSortModelToApiSort(model);

      const updatedFilters: Record<string, unknown> = { ...appliedFilters };

      if (apiSort.length > 0) {
        updatedFilters.sort = apiSort;
      } else {
        if ('sort' in updatedFilters) {
          delete updatedFilters.sort;
        }
      }

      const cleanFilters = removeEmptyParams(updatedFilters);

      setAppliedFilters(removeEmptyParams(updatedFilters));

      return cleanFilters;
    },
    [appliedFilters, mapSortModelToApiSort, removeEmptyParams]
  );

  const resetFilters = useCallback(() => {
    setDraftFilters(completeInitialFilters);
    setAppliedFilters(completeInitialFilters);
    setSortModel([]);

    return removeEmptyParams(completeInitialFilters);
  }, [completeInitialFilters, removeEmptyParams]);

  const getInitialFilters = useCallback(() => {
    if (!initialFetchDone.current) {
      const cleanFilters = removeEmptyParams(completeInitialFilters);
      initialFetchDone.current = true;
      return cleanFilters;
    }
    return null;
  }, [completeInitialFilters, removeEmptyParams]);

  return {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    sortModel,
    handleSortModelChange,
    isFilterActive,
    resetFilters,
    getInitialFilters,
    initialFetchDone: initialFetchDone.current
  };
}

export default useDebtTypesCreatedFilters;
