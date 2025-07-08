import { useState, useCallback } from 'react';
import { GridSortModel } from '@mui/x-data-grid';

/**
 * Tipo per i filtri dell'assessment detail
 */
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
 * Hook per la gestione dei filtri nella pagina di dettaglio assessment.
 * Gestisce filtri applicati, draft filters, ordinamento e paginazione.
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
   * Verifica se ci sono filtri attivi non ancora applicati
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
   * Aggiorna i filtri draft (non ancora applicati)
   */
  const updateDraftFilters = useCallback(
    (updates: Partial<AssessmentDetailFilters>) => {
      setDraftFilters((prev) => {
        const cleanedUpdates = { ...updates };

        // Rimuove valori vuoti
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
   * Applica i filtri draft ai filtri attivi
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
   * Gestisce il cambio di data inizio per update date
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
   * Gestisce il cambio di data fine per update date
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
   * Gestisce il cambio di data inizio per payment date
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
   * Gestisce il cambio di data fine per payment date
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
   * Gestisce i cambi di ordinamento
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
    handleDateFromChange,
    handleDateToChange,
    handlePaymentDateFromChange,
    handlePaymentDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  };
};
