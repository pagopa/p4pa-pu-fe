import { useState, useCallback } from 'react';

export type ReportingDetailFilters = {
  iuv?: string;
  payDateFrom?: string;
  payDateTo?: string;
};

type UseReportingFiltersProps = {
  initialFilters?: Partial<ReportingDetailFilters>;
};

export const useReportingDetailFilters = ({
  initialFilters
}: UseReportingFiltersProps = {}) => {
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const updateFilters = useCallback(
    (updates: Partial<ReportingDetailFilters>) => {
      setAppliedFilters((prev) => {
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
      ...appliedFilters,
      iuv: appliedFilters?.iuv?.trim() || undefined
    };

    setAppliedFilters(filtersToApply);
  }, [appliedFilters]);

  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateFilters({
        payDateFrom: date
          ? new Date(date.setHours(0, 0, 0, 0)).toISOString().split('T')[0]
          : undefined
      });
    },
    [updateFilters]
  );

  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateFilters({
        payDateTo: date
          ? new Date(date.setHours(23, 59, 59, 999)).toISOString().split('T')[0]
          : undefined
      });
    },
    [updateFilters]
  );

  return {
    appliedFilters,
    updateFilters,
    applyFilters,
    handleDateFromChange,
    handleDateToChange
  };
};
