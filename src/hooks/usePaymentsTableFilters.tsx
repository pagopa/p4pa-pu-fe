import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { subDays } from 'date-fns';
import { useSearchParams } from 'react-router';
import { toStartOfDay, toEndOfDay } from '../utils/formatters';
import {
  convertFiltersToAPI,
  PaymentsUIFilters,
  PaidInstallmentsFilters
} from '../api/classifications/paidInstallments/mappings';

// API filters (with dates as ISO strings)
export type PaymentsAPIFilters = PaidInstallmentsFilters;

type UsePaymentsTableFiltersProps = {
  initialFilters?: Partial<PaymentsUIFilters>;
  onFiltersChange?: (
    filters: PaymentsUIFilters,
    pagination: { page: number; size: number },
    sortParams?: Array<string>
  ) => void;
  onFilterValidationError?: (hasError: boolean) => void;
  autoLoadOnMount?: boolean;
};

const DEFAULT_PAGE_SIZE = 10;

const createStableDefaultFilters = (): PaymentsUIFilters => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  return {
    dateFrom: toStartOfDay(thirtyDaysAgo),
    dateTo: toEndOfDay(today)
  };
};

/**
 * Hook for complete filter management in PaymentsTable
 *
 * Responsibilities:
 * - Draft vs applied filters management with validation
 * - Pagination management
 * - Sorting management with automatic pagination reset
 * - Auto-load on mount
 * - UI -> API conversion delegation to mapping layer
 * - Required filters validation
 */
export const usePaymentsTableFilters = ({
  initialFilters = {},
  onFiltersChange,
  onFilterValidationError,
  autoLoadOnMount = true
}: UsePaymentsTableFiltersProps = {}) => {
  const [searchParams] = useSearchParams();

  // Read pagination from URL on mount
  const getInitialPaginationFromUrl = useMemo(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlSize = parseInt(
      searchParams.get('size') || String(DEFAULT_PAGE_SIZE)
    );

    return {
      page: Math.max(0, urlPage - 1), // Convert to 0-based and validate
      size: urlSize > 0 ? urlSize : DEFAULT_PAGE_SIZE
    };
  }, [searchParams]);

  const defaultFilters = useMemo((): PaymentsUIFilters => {
    if (initialFilters?.dateFrom && initialFilters?.dateTo) {
      return initialFilters;
    }
    return createStableDefaultFilters();
  }, [initialFilters?.dateFrom, initialFilters?.dateTo]);

  const [draftFilters, setDraftFilters] =
    useState<PaymentsUIFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<PaymentsUIFilters>(defaultFilters);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Auto-load management
  const hasAutoLoadedRef = useRef(false);

  // Validates that at least one filter is filled
  const hasValidFilters = useCallback(() => {
    const { iud, dateFrom, dateTo, updateDateFrom, updateDateTo } =
      draftFilters;

    return !!(
      (iud && iud.trim() !== '') ||
      dateFrom ||
      dateTo ||
      updateDateFrom ||
      updateDateTo
    );
  }, [draftFilters]);

  // Checks if there are active filters not yet applied
  const hasActiveFilters = useCallback(() => {
    const isIudChanged =
      (draftFilters.iud || '') !== (appliedFilters.iud || '');
    const isDateFromChanged = draftFilters.dateFrom !== appliedFilters.dateFrom;
    const isDateToChanged = draftFilters.dateTo !== appliedFilters.dateTo;
    const isUpdateDateFromChanged =
      draftFilters.updateDateFrom !== appliedFilters.updateDateFrom;
    const isUpdateDateToChanged =
      draftFilters.updateDateTo !== appliedFilters.updateDateTo;

    return (
      isIudChanged ||
      isDateFromChanged ||
      isDateToChanged ||
      isUpdateDateFromChanged ||
      isUpdateDateToChanged
    );
  }, [draftFilters, appliedFilters]);

  // Updates draft filters (not yet applied)
  const updateDraftFilters = useCallback(
    (updates: Partial<PaymentsUIFilters>) => {
      setDraftFilters((prev) => {
        const cleanedUpdates = { ...updates };

        // Remove empty values
        Object.keys(cleanedUpdates).forEach((key) => {
          const typedKey = key as keyof PaymentsUIFilters;
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

  // Applies draft filters with validation
  const applyFilters = useCallback(() => {
    // Verify that at least one filter is filled
    if (!hasValidFilters()) {
      // Trigger validation error in parent component
      if (onFilterValidationError) {
        onFilterValidationError(true);
      }
      return;
    }

    // Clear any previous validation errors
    if (onFilterValidationError) {
      onFilterValidationError(false);
    }

    // Apply filters
    const filtersToApply = { ...draftFilters };
    setAppliedFilters(filtersToApply);

    // Notify parent component which will trigger onFiltersApplied in CustomDataGrid
    // that will automatically reset pagination, keeping the size from URL
    if (onFiltersChange) {
      onFiltersChange(filtersToApply, {
        page: 0,
        size: getInitialPaginationFromUrl.size
      });
    }
  }, [
    draftFilters,
    hasValidFilters,
    onFilterValidationError,
    onFiltersChange,
    getInitialPaginationFromUrl.size
  ]);

  // Handles sort model change
  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel);

      // Convert to API format
      const sortParams =
        newModel.length > 0
          ? [`${newModel[0].field},${newModel[0].sort}`]
          : undefined;

      // CustomDataGrid will automatically handle pagination reset via smartPagination
      // Notify parent with sort parameters, keeping the size from URL
      if (onFiltersChange) {
        onFiltersChange(
          appliedFilters,
          { page: 0, size: getInitialPaginationFromUrl.size },
          sortParams
        );
      }
    },
    [appliedFilters, onFiltersChange, getInitialPaginationFromUrl.size]
  );

  // Date handlers
  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({ dateFrom: date });
    },
    [updateDraftFilters]
  );

  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({ dateTo: date });
    },
    [updateDraftFilters]
  );

  const handleUpdateDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({ updateDateFrom: date });
    },
    [updateDraftFilters]
  );

  const handleUpdateDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({ updateDateTo: date });
    },
    [updateDraftFilters]
  );

  // Auto-apply default filters on mount ONLY ONCE
  useEffect(() => {
    if (autoLoadOnMount && !hasAutoLoadedRef.current && onFiltersChange) {
      hasAutoLoadedRef.current = true;
      onFiltersChange(defaultFilters, getInitialPaginationFromUrl);
    }
  }, [
    autoLoadOnMount,
    onFiltersChange,
    defaultFilters,
    getInitialPaginationFromUrl
  ]);

  return {
    appliedFilters,
    draftFilters,
    sortModel,
    hasActiveFilters: hasActiveFilters(),
    hasValidFilters: hasValidFilters(),
    updateDraftFilters,
    applyFilters,
    handleSortModelChange,
    handleDateFromChange,
    handleDateToChange,
    handleUpdateDateFromChange,
    handleUpdateDateToChange,
    convertFiltersToAPI
  };
};
