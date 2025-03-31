import { useState, useCallback } from 'react';
import { GridSortModel } from '@mui/x-data-grid';

export type ReportingDetailFilters = {
  iuv?: string;
  payDateFrom?: string;
  payDateTo?: string;
  page: number;
  size: number;
  sort?: Array<string>;
};

type PaginationParams = {
  page?: number;
  size?: number;
};

type UseReportingFiltersProps = {
  initialFilters?: Partial<ReportingDetailFilters>;
  onFiltersChange?: (filters: ReportingDetailFilters) => void;
};

const DEFAULT_PAGE_SIZE = 10;

export const useReportingDetailFilters = ({
  initialFilters,
  onFiltersChange
}: UseReportingFiltersProps = {}) => {
  const [appliedFilters, setAppliedFilters] = useState<ReportingDetailFilters>(
    () => ({
      size: initialFilters?.size || DEFAULT_PAGE_SIZE,
      page: initialFilters?.page || 0,
      ...initialFilters
    })
  );

  const [draftFilters, setDraftFilters] =
    useState<ReportingDetailFilters>(appliedFilters);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const hasActiveFilters = useCallback(() => {
    const isIuvChanged =
      (draftFilters.iuv || '') !== (appliedFilters.iuv || '');
    const isDateFromChanged =
      draftFilters.payDateFrom !== appliedFilters.payDateFrom;
    const isDateToChanged = draftFilters.payDateTo !== appliedFilters.payDateTo;

    return isIuvChanged || isDateFromChanged || isDateToChanged;
  }, [
    draftFilters.iuv,
    draftFilters.payDateFrom,
    draftFilters.payDateTo,
    appliedFilters.iuv,
    appliedFilters.payDateFrom,
    appliedFilters.payDateTo
  ]);

  const updateDraftFilters = useCallback(
    (updates: Partial<ReportingDetailFilters>) => {
      setDraftFilters((prev) => {
        const cleanedUpdates = { ...updates };

        Object.keys(cleanedUpdates).forEach((key) => {
          const typedKey = key as keyof ReportingDetailFilters;
          const value = cleanedUpdates[typedKey];
          if (typeof value === 'string' && value === '') {
            cleanedUpdates[typedKey] = undefined;
          }
        });

        return {
          ...prev,
          ...cleanedUpdates
        };
      });
    },
    []
  );

  const applyFilters = useCallback(() => {
    const filtersToApply = {
      ...draftFilters,
      iuv: draftFilters.iuv?.trim() || undefined,
      page: 0
    };
    setAppliedFilters(filtersToApply);
    onFiltersChange?.(filtersToApply);
  }, [draftFilters, onFiltersChange]);

  const updatePagination = useCallback(
    (paginationUpdate: PaginationParams) => {
      const newFilters = {
        ...appliedFilters,
        ...paginationUpdate
      };
      setAppliedFilters(newFilters);
      setDraftFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [appliedFilters, onFiltersChange]
  );

  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        payDateFrom: date
          ? new Date(date.setHours(0, 0, 0, 0)).toISOString().split('T')[0]
          : undefined
      });
    },
    [updateDraftFilters]
  );

  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        payDateTo: date
          ? new Date(date.setHours(23, 59, 59, 999)).toISOString().split('T')[0]
          : undefined
      });
    },
    [updateDraftFilters]
  );

  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel);

      const [firstSort] = newModel;
      const sortValue = firstSort && `${firstSort.field},${firstSort.sort}`;

      const newFilters = {
        ...appliedFilters,
        page: 0,
        sort: sortValue ? [sortValue] : undefined
      };

      setAppliedFilters(newFilters);
      setDraftFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [appliedFilters, onFiltersChange]
  );

  return {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    handleDateFromChange,
    handleDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  };
};
