import { useState, useCallback, useMemo } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { usePaginationState } from './usePaginationState';

export type ReportingDetailBusinessFilters = {
  iuv?: string;
  payDateFrom?: string;
  payDateTo?: string;
};

export type ReportingDetailFilters = ReportingDetailBusinessFilters & {
  page: number;
  size: number;
  sort?: Array<string>;
};

type PaginationParams = {
  page: number;
  size: number;
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
  const {
    paginationParams,
    handlePaginationChange: updatePaginationState,
    setPaginationParams
  } = usePaginationState({
    initialPage: initialFilters?.page ?? 0,
    initialSize: initialFilters?.size ?? DEFAULT_PAGE_SIZE
  });

  const [appliedFilters, setAppliedFilters] =
    useState<ReportingDetailBusinessFilters>(() => ({
      iuv: initialFilters?.iuv,
      payDateFrom: initialFilters?.payDateFrom,
      payDateTo: initialFilters?.payDateTo
    }));

  const [draftFilters, setDraftFilters] =
    useState<ReportingDetailBusinessFilters>(appliedFilters);

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const getCompleteFilters = useCallback((): ReportingDetailFilters => {
    const completeFilters = {
      ...appliedFilters,
      page: paginationParams.page,
      size: paginationParams.size,
      ...(sortModel.length > 0 && {
        sort: [`${sortModel[0].field},${sortModel[0].sort}`]
      })
    };

    return completeFilters;
  }, [
    appliedFilters.iuv,
    appliedFilters.payDateFrom,
    appliedFilters.payDateTo,
    paginationParams.page,
    paginationParams.size,
    sortModel.length,
    sortModel[0]?.field,
    sortModel[0]?.sort
  ]);

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
    (updates: Partial<ReportingDetailBusinessFilters>) => {
      setDraftFilters((prev) => {
        const cleanedUpdates = { ...updates };

        Object.keys(cleanedUpdates).forEach((key) => {
          const typedKey = key as keyof ReportingDetailBusinessFilters;
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
      iuv: draftFilters.iuv?.trim() || undefined
    };

    setAppliedFilters(filtersToApply);

    setPaginationParams((prev) => ({ ...prev, page: 0 }));

    const completeFilters = {
      ...filtersToApply,
      page: 0,
      size: paginationParams.size
    };

    onFiltersChange?.(completeFilters);
  }, [
    draftFilters,
    paginationParams.size,
    setPaginationParams,
    onFiltersChange
  ]);

  const updatePagination = useCallback(
    (pagination: PaginationParams) => {
      updatePaginationState(pagination);

      const completeFilters = {
        ...appliedFilters,
        ...pagination,
        ...(sortModel.length > 0 && {
          sort: [`${sortModel[0].field},${sortModel[0].sort}`]
        })
      };

      onFiltersChange?.(completeFilters);
    },
    [appliedFilters, sortModel, onFiltersChange, updatePaginationState]
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

      setPaginationParams((prev) => ({ ...prev, page: 0 }));

      const completeFilters = getCompleteFilters();
      onFiltersChange?.({
        ...completeFilters,
        page: 0,
        ...(newModel.length > 0 && {
          sort: [`${newModel[0].field},${newModel[0].sort}`]
        })
      });
    },
    [getCompleteFilters, setPaginationParams, onFiltersChange]
  );

  const memoizedCompleteFilters = useMemo(() => {
    return getCompleteFilters();
  }, [getCompleteFilters]);

  return {
    appliedFilters: memoizedCompleteFilters,
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
