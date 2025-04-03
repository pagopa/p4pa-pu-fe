import { useState, useEffect } from 'react';
import { GridSortModel } from '@mui/x-data-grid';

type FiltersState = {
  page: number;
  size: number;
  sort?: Array<string>;
  description?: string;
};

type UseDebtTypesFiltersProps = {
  initialFilters: Partial<FiltersState>;
  onFiltersChange?: (filters: FiltersState) => void;
};

const useDebtTypesFilters = ({
  initialFilters,
  onFiltersChange
}: UseDebtTypesFiltersProps) => {
  const defaultFilters: FiltersState = {
    page: 0,
    size: 10,
    ...initialFilters
  };

  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(defaultFilters);

  const [draftFilters, setDraftFilters] =
    useState<FiltersState>(defaultFilters);

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const isSearchEnabled =
    draftFilters.description !== appliedFilters.description;

  const updateDraftFilters = (newFilters: Partial<FiltersState>) => {
    setDraftFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    const updatedFilters = { ...draftFilters, page: 0 };
    setAppliedFilters(updatedFilters);

    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const updatePagination = ({ page, size }: { page: number; size: number }) => {
    const updatedFilters = { ...appliedFilters, page, size };
    setAppliedFilters(updatedFilters);
    setDraftFilters((prev) => ({ ...prev, page, size }));

    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);

    const apiSort = model.map(
      (item) => `${item.field},${item.sort === 'desc' ? 'desc' : 'asc'}`
    );

    const updatedFilters = {
      ...appliedFilters,
      sort: apiSort.length > 0 ? apiSort : undefined
    };
    setAppliedFilters(updatedFilters);

    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  useEffect(() => {
    const newFilters = { ...defaultFilters, ...initialFilters };
    setAppliedFilters(newFilters);
    setDraftFilters(newFilters);
  }, [JSON.stringify(initialFilters)]);

  return {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    sortModel,
    handleSortModelChange,
    isSearchEnabled
  };
};

export default useDebtTypesFilters;
