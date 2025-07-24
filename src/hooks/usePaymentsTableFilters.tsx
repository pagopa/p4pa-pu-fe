import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { useSearchParams } from 'react-router';

// Filtri per l'interfaccia utente (con date come Date objects)
export type PaymentsUIFilters = {
  iud?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  updateDateFrom?: Date | null;
  updateDateTo?: Date | null;
};

// Filtri per l'API (con date come stringhe ISO)
export type PaymentsAPIFilters = {
  iud?: string;
  paymentDateTimeFrom?: string;
  paymentDateTimeTo?: string;
  updateDateFrom?: string;
  updateDateTo?: string;
};

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

/**
 * Crea filtri di default stabili per evitare re-render infiniti
 * Utilizza date-fns seguendo pattern esistenti del progetto
 */
const createStableDefaultFilters = (): PaymentsUIFilters => {
  return {
    dateFrom: startOfDay(subDays(new Date(), 30)),
    dateTo: endOfDay(new Date())
  };
};

/**
 * Converte filtri UI in formato API
 * Esportata come utility function per riuso in altri componenti (DRY principle)
 */
export const convertFiltersToAPI = (
  uiFilters: PaymentsUIFilters
): PaymentsAPIFilters => {
  const apiFilters: PaymentsAPIFilters = {};

  if (uiFilters.iud?.trim()) {
    apiFilters.iud = uiFilters.iud.trim();
  }

  if (uiFilters.dateFrom && uiFilters.dateTo) {
    apiFilters.paymentDateTimeFrom = uiFilters.dateFrom.toISOString();
    apiFilters.paymentDateTimeTo = uiFilters.dateTo.toISOString();
  }

  if (uiFilters.updateDateFrom && uiFilters.updateDateTo) {
    apiFilters.updateDateFrom = uiFilters.updateDateFrom.toISOString();
    apiFilters.updateDateTo = uiFilters.updateDateTo.toISOString();
  }

  // Garantisce sempre un filtro date se non presente (requisito API)
  if (!apiFilters.paymentDateTimeFrom && !apiFilters.paymentDateTimeTo) {
    const to = endOfDay(new Date());
    const from = startOfDay(subDays(new Date(), 30));
    apiFilters.paymentDateTimeFrom = from.toISOString();
    apiFilters.paymentDateTimeTo = to.toISOString();
  }

  return apiFilters;
};

/**
 * Hook per la gestione completa dei filtri nella PaymentsTable
 * Segue il pattern consolidato del progetto (useAssessmentDetailFilters)
 *
 * Responsabilità:
 * - Gestione filtri draft vs applied con validazione
 * - Gestione paginazione
 * - Gestione sorting con reset automatico paginazione
 * - Auto-load al mount
 * - Conversione formati UI -> API
 * - Validazione filtri obbligatori
 */
export const usePaymentsTableFilters = ({
  initialFilters = {},
  onFiltersChange,
  onFilterValidationError,
  autoLoadOnMount = true
}: UsePaymentsTableFiltersProps = {}) => {
  const [searchParams] = useSearchParams();

  // Legge la paginazione dall'URL al mount (pattern del progetto)
  const getInitialPaginationFromUrl = useMemo(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlSize = parseInt(
      searchParams.get('size') || String(DEFAULT_PAGE_SIZE)
    );

    return {
      page: Math.max(0, urlPage - 1), // Convert to 0-based e valida
      size: urlSize > 0 ? urlSize : DEFAULT_PAGE_SIZE
    };
  }, [searchParams]);

  // Filtri di default stabili (pattern del progetto)
  const defaultFilters = useMemo((): PaymentsUIFilters => {
    // Se ci sono initialFilters validi, usali
    if (initialFilters?.dateFrom && initialFilters?.dateTo) {
      return initialFilters;
    }
    // Altrimenti usa i filtri di default stabili
    return createStableDefaultFilters();
  }, [initialFilters?.dateFrom, initialFilters?.dateTo]);

  const [draftFilters, setDraftFilters] =
    useState<PaymentsUIFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<PaymentsUIFilters>(defaultFilters);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Auto-load management (pattern del progetto)
  const hasAutoLoadedRef = useRef(false);

  /**
   * Valida che almeno un filtro sia compilato
   * Segue la logica originale di PaymentsTable
   */
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

  /**
   * Verifica se ci sono filtri attivi non ancora applicati
   */
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

  /**
   * Aggiorna i filtri draft (non ancora applicati)
   */
  const updateDraftFilters = useCallback(
    (updates: Partial<PaymentsUIFilters>) => {
      setDraftFilters((prev) => {
        const cleanedUpdates = { ...updates };

        // Rimuove valori vuoti
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

  /**
   * Applica i filtri draft con validazione
   * Segue la logica originale di PaymentsTable.applyFilters
   * NOTA: La paginazione è ora gestita da CustomDataGrid tramite smartPagination
   */
  const applyFilters = useCallback(() => {
    // Verifica che almeno un filtro sia compilato
    if (!hasValidFilters()) {
      // Triggera errore di validazione nel parent component
      if (onFilterValidationError) {
        onFilterValidationError(true);
      }
      return;
    }

    // Pulisce eventuali errori di validazione precedenti
    if (onFilterValidationError) {
      onFilterValidationError(false);
    }

    // Applica filtri (la paginazione sarà gestita da smartPagination)
    const filtersToApply = { ...draftFilters };
    setAppliedFilters(filtersToApply);

    // Notifica il parent component che triggererà onFiltersApplied in CustomDataGrid
    // che resetterà automaticamente la paginazione, mantendo il size dall'URL
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

  /**
   * Gestisce il cambio del modello di ordinamento
   * NOTA: La paginazione è ora gestita da CustomDataGrid tramite smartPagination
   */
  const handleSortModelChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel);

      // Converte in formato API
      const sortParams =
        newModel.length > 0
          ? [`${newModel[0].field},${newModel[0].sort}`]
          : undefined;

      // CustomDataGrid gestirà automaticamente il reset della paginazione tramite smartPagination
      // Notifica il parent con i parametri di sort, mantiene il size dall'URL
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

  /**
   * Gestori per le date
   */
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

  /**
   * Auto-applica i filtri di default al mount SOLO UNA VOLTA
   * Segue il pattern di PaymentsTable con useRef persistente
   * IMPORTANTE: Usa la paginazione dall'URL per sincronizzazione corretta
   */
  useEffect(() => {
    if (autoLoadOnMount && !hasAutoLoadedRef.current && onFiltersChange) {
      hasAutoLoadedRef.current = true;
      // Usa paginazione dall'URL invece di valore hardcoded
      onFiltersChange(defaultFilters, getInitialPaginationFromUrl);
    }
  }, [
    autoLoadOnMount,
    onFiltersChange,
    defaultFilters,
    getInitialPaginationFromUrl
  ]);

  return {
    // Stato
    appliedFilters,
    draftFilters,
    sortModel,

    // Computed
    hasActiveFilters: hasActiveFilters(),
    hasValidFilters: hasValidFilters(),

    // Actions
    updateDraftFilters,
    applyFilters,
    handleSortModelChange,
    handleDateFromChange,
    handleDateToChange,
    handleUpdateDateFromChange,
    handleUpdateDateToChange
  };
};
