import { useState, useCallback } from 'react';
import { GridSortModel } from '@mui/x-data-grid';

export type AssessmentDetailFilters = {
  iuv?: string;
  iud?: string;
  updateDateTimeFrom?: string;
  updateDateTimeTo?: string;
  paymentDateTimeFrom?: string;
  paymentDateTimeTo?: string;
  fiscalCode?: string;
  page: number;
  size: number;
  sort?: Array<string>;
};

type UseAssessmentDetailFiltersProps = {
  initialFilters?: Partial<AssessmentDetailFilters>;
  onFiltersChange?: (filters: AssessmentDetailFilters) => void;
};

const DEFAULT_PAGE_SIZE = 10;

/**
 * Hook for the management of the filters in the assessment detail page.
 * Handles applied filters, draft filters, sorting and pagination.
 */
export const useAssessmentDetailFilters = ({
  initialFilters,
  onFiltersChange
}: UseAssessmentDetailFiltersProps = {}) => {
  const [appliedFilters, setAppliedFilters] = useState<AssessmentDetailFilters>(
    () => ({
      size: initialFilters?.size || DEFAULT_PAGE_SIZE,
      page: initialFilters?.page || 0,
      ...initialFilters
    })
  );

  const [draftFilters, setDraftFilters] =
    useState<AssessmentDetailFilters>(appliedFilters);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  /**
   * Check if there are active filters that have not been applied yet
   */
  const hasActiveFilters = useCallback(() => {
    const isIuvChanged =
      (draftFilters.iuv || '') !== (appliedFilters.iuv || '');
    const isIudChanged =
      (draftFilters.iud || '') !== (appliedFilters.iud || '');
    const isUpdateDateFromChanged =
      draftFilters.updateDateTimeFrom !== appliedFilters.updateDateTimeFrom;
    const isUpdateDateToChanged =
      draftFilters.updateDateTimeTo !== appliedFilters.updateDateTimeTo;
    const isPaymentDateFromChanged =
      draftFilters.paymentDateTimeFrom !== appliedFilters.paymentDateTimeFrom;
    const isPaymentDateToChanged =
      draftFilters.paymentDateTimeTo !== appliedFilters.paymentDateTimeTo;
    const isFiscalCodeChanged =
      (draftFilters.fiscalCode || '') !== (appliedFilters.fiscalCode || '');

    return (
      isIuvChanged ||
      isIudChanged ||
      isUpdateDateFromChanged ||
      isUpdateDateToChanged ||
      isPaymentDateFromChanged ||
      isPaymentDateToChanged ||
      isFiscalCodeChanged
    );
  }, [
    draftFilters.iuv,
    draftFilters.iud,
    draftFilters.updateDateTimeFrom,
    draftFilters.updateDateTimeTo,
    draftFilters.paymentDateTimeFrom,
    draftFilters.paymentDateTimeTo,
    draftFilters.fiscalCode,
    appliedFilters.iuv,
    appliedFilters.iud,
    appliedFilters.updateDateTimeFrom,
    appliedFilters.updateDateTimeTo,
    appliedFilters.paymentDateTimeFrom,
    appliedFilters.paymentDateTimeTo,
    appliedFilters.fiscalCode
  ]);

  /**
   * Update the draft filters (not yet applied)
   */
  const updateDraftFilters = useCallback(
    (updates: Partial<AssessmentDetailFilters>) => {
      setDraftFilters((prev) => {
        const cleanedUpdates = { ...updates };

        // Remove empty values
        Object.keys(cleanedUpdates).forEach((key) => {
          const typedKey = key as keyof AssessmentDetailFilters;
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

  /**
   * Apply the draft filters to the active filters
   */
  const applyFilters = useCallback(() => {
    const filtersToApply = {
      ...draftFilters,
      iuv: draftFilters.iuv?.trim() || undefined,
      iud: draftFilters.iud?.trim() || undefined,
      fiscalCode: draftFilters.fiscalCode?.trim() || undefined,
      page: 0,
      size: appliedFilters.size
    };
    setAppliedFilters(filtersToApply);
    onFiltersChange?.(filtersToApply);
  }, [draftFilters, appliedFilters.size, onFiltersChange]);

  /**
   * Update pagination parameters and trigger filters change
   */
  const updatePagination = useCallback(
    ({ page, size }: { page: number; size: number }) => {
      const updatedFilters = { ...appliedFilters, page, size };
      setAppliedFilters(updatedFilters);
      setDraftFilters((prev) => ({ ...prev, page, size }));
      onFiltersChange?.(updatedFilters);
    },
    [appliedFilters, onFiltersChange]
  );

  /**
   * Handle the change of start date for update date
   */
  const handleDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        updateDateTimeFrom: date
          ? new Date(date.setHours(0, 0, 0, 0)).toISOString()
          : undefined
      });
    },
    [updateDraftFilters]
  );

  /**
   * Handle the change of end date for update date
   */
  const handleDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        updateDateTimeTo: date
          ? new Date(date.setHours(23, 59, 59, 999)).toISOString()
          : undefined
      });
    },
    [updateDraftFilters]
  );

  /**
   * Handle the change of start date for payment date
   */
  const handlePaymentDateFromChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        paymentDateTimeFrom: date
          ? new Date(date.setHours(0, 0, 0, 0)).toISOString()
          : undefined
      });
    },
    [updateDraftFilters]
  );

  /**
   * Handle the change of end date for payment date
   */
  const handlePaymentDateToChange = useCallback(
    (date: Date | null) => {
      updateDraftFilters({
        paymentDateTimeTo: date
          ? new Date(date.setHours(23, 59, 59, 999)).toISOString()
          : undefined
      });
    },
    [updateDraftFilters]
  );

  /**
   * Handle the change of sorting
   */
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
    handlePaymentDateFromChange,
    handlePaymentDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  };
};
