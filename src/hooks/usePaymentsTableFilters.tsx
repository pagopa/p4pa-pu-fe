import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { subDays } from 'date-fns';
import { toStartOfDay, toEndOfDay } from '../utils/formatters';
import {
  convertFiltersToAPI,
  PaymentsUIFilters
} from '../api/classifications/paidInstallments/mappings';

type UsePaymentsTableFiltersProps = {
  initialFilters?: Partial<PaymentsUIFilters>;
  onFiltersChange?: (filters: PaymentsUIFilters) => void;
  onFilterValidationError?: (hasError: boolean) => void;
  autoLoadOnMount?: boolean;
};

const createStableDefaultFilters = (): PaymentsUIFilters => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  return {
    dateFrom: toStartOfDay(thirtyDaysAgo),
    dateTo: toEndOfDay(today)
  };
};

export const usePaymentsTableFilters = ({
  initialFilters = {},
  onFiltersChange,
  onFilterValidationError,
  autoLoadOnMount = true
}: UsePaymentsTableFiltersProps = {}) => {
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

  const hasAutoLoadedRef = useRef(false);

  // Validates that at least one filter is filled
  const hasValidFilters = useCallback(() => {
    const { iuv, dateFrom, dateTo, updateDateFrom, updateDateTo } =
      draftFilters;

    return !!(
      (iuv && iuv.trim() !== '') ||
      dateFrom ||
      dateTo ||
      updateDateFrom ||
      updateDateTo
    );
  }, [draftFilters]);

  // Checks if there are active filters not yet applied
  const hasActiveFilters = useCallback(() => {
    const isIuvChanged =
      (draftFilters.iuv || '') !== (appliedFilters.iuv || '');
    const isDateFromChanged = draftFilters.dateFrom !== appliedFilters.dateFrom;
    const isDateToChanged = draftFilters.dateTo !== appliedFilters.dateTo;
    const isUpdateDateFromChanged =
      draftFilters.updateDateFrom !== appliedFilters.updateDateFrom;
    const isUpdateDateToChanged =
      draftFilters.updateDateTo !== appliedFilters.updateDateTo;

    return (
      isIuvChanged ||
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

        // Remove empty string values
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
    if (!hasValidFilters()) {
      if (onFilterValidationError) {
        onFilterValidationError(true);
      }
      return;
    }

    if (onFilterValidationError) {
      onFilterValidationError(false);
    }

    const filtersToApply = { ...draftFilters };
    setAppliedFilters(filtersToApply);

    if (onFiltersChange) {
      onFiltersChange(filtersToApply);
    }
  }, [draftFilters, hasValidFilters, onFilterValidationError, onFiltersChange]);

  // Date handlers
  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({ dateFrom: date ?? undefined });
    },
    [updateDraftFilters]
  );

  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({ dateTo: date ?? undefined });
    },
    [updateDraftFilters]
  );

  // Auto-apply default filters on mount ONLY ONCE
  useEffect(() => {
    if (autoLoadOnMount && !hasAutoLoadedRef.current && onFiltersChange) {
      hasAutoLoadedRef.current = true;
      onFiltersChange(defaultFilters);
    }
  }, [autoLoadOnMount, onFiltersChange, defaultFilters]);

  return {
    appliedFilters,
    draftFilters,
    hasActiveFilters: hasActiveFilters(),
    hasValidFilters: hasValidFilters(),
    updateDraftFilters,
    applyFilters,
    handleDateFromChange,
    handleDateToChange,
    convertFiltersToAPI
  };
};
