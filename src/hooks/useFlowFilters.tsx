import { useState, useCallback } from 'react';
import { FlowFileFilters, FlowFileType, PaginationParams } from '../store/types';


interface UseFlowFiltersProps {
  initialFilters?: Partial<FlowFileFilters>;
  flowFileTypes: FlowFileType[];
  onFiltersChange?: (filters: FlowFileFilters) => void;
}

const DEFAULT_PAGE_SIZE = 10;

export const useFlowFilters = ({ 
  flowFileTypes,
  initialFilters,
  onFiltersChange 
}: UseFlowFiltersProps) => {
  const [appliedFilters, setAppliedFilters] = useState<FlowFileFilters>(() => ({
    flowFileTypes,
    size: initialFilters?.size || DEFAULT_PAGE_SIZE,
    page: initialFilters?.page || 0,
    ...initialFilters
  }));

  const [draftFilters, setDraftFilters] = useState<FlowFileFilters>(appliedFilters);


  const updateDraftFilters = useCallback((updates: Partial<FlowFileFilters>) => {
    setDraftFilters(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const applyFilters = useCallback(() => {
    const filtersToApply = {
      ...draftFilters,
      page: 0
    };
    setAppliedFilters(filtersToApply);
    onFiltersChange?.(filtersToApply);
  }, [draftFilters, onFiltersChange]);

  const updatePagination = useCallback((paginationUpdate: PaginationParams) => {
    const newFilters = {
      ...appliedFilters,
      ...paginationUpdate
    };
    setAppliedFilters(newFilters);
    setDraftFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [appliedFilters, onFiltersChange]);

  const handleDateFromChange = useCallback((date: Date | null) => {
    updateDraftFilters({
      creationDateFrom: date ? 
        new Date(date.setHours(0, 0, 0, 0)).toISOString() : 
        undefined
    });
  }, [updateDraftFilters]);

  const handleDateToChange = useCallback((date: Date | null) => {
    updateDraftFilters({
      creationDateTo: date ? 
        new Date(date.setHours(23, 59, 59, 999)).toISOString() : 
        undefined
    });
  }, [updateDraftFilters]);

  return {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    handleDateFromChange,
    handleDateToChange
  };
};
