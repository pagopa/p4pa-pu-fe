import { useState, useCallback } from 'react';
import { PagedPaidInstallmentsDTO } from '../api/classifications/paidInstallments/mappings';

/**
 * Hook semplificato per gestire stato dei pagamenti nel Step2
 *
 * Principi applicati:
 * - SOLID: Single Responsibility (solo state management dati e validazione)
 * - DRY: Evita duplicazioni con altri hook
 * - KISS: Interfaccia semplice e diretta
 *
 * Nota: La gestione di sorting, filtri e paginazione è stata estratta
 * nell'hook specializzato usePaymentsTableFilters seguendo il pattern del progetto.
 */
export const useStep2PaymentsState = () => {
  // Stato dei dati pagamenti
  const [paymentsData, setPaymentsData] = useState<PagedPaidInstallmentsDTO>({
    content: [],
    size: 10,
    totalElements: 0,
    totalPages: 0,
    number: 0
  });

  // Stato errori di validazione
  const [showPaymentsValidationError, setShowPaymentsValidationError] =
    useState(false);
  const [showFiltersValidationError, setShowFiltersValidationError] =
    useState(false);

  // Actions - callbacks memoizzati per performance
  const updatePaymentsData = useCallback((data: PagedPaidInstallmentsDTO) => {
    // Forza un nuovo oggetto per garantire re-render
    setPaymentsData({
      ...data,
      content: [...(data.content || [])] // Crea una nuova reference dell'array
    });
  }, []);

  const resetPaymentsData = useCallback(() => {
    setPaymentsData({
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    });
  }, []);

  const clearValidationErrors = useCallback(() => {
    setShowPaymentsValidationError(false);
    setShowFiltersValidationError(false);
  }, []);

  // Interfaccia semplificata - solo essenziale
  return {
    // State
    paymentsData,
    showPaymentsValidationError,
    showFiltersValidationError,

    // Actions
    updatePaymentsData,
    resetPaymentsData,
    setShowPaymentsValidationError,
    setShowFiltersValidationError,
    clearValidationErrors,

    // Computed helpers
    hasPaymentsData: paymentsData.content.length > 0,
    totalPayments: paymentsData.totalElements
  };
};
