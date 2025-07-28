import { useState, useCallback } from 'react';
import { PagedPaidInstallmentsDTO } from '../api/classifications/paidInstallments/mappings';

/**
 * Hook for managing the state of payments in Step2
 */
export const useStep2PaymentsState = () => {
  const [paymentsData, setPaymentsData] = useState<PagedPaidInstallmentsDTO>({
    content: [],
    size: 10,
    totalElements: 0,
    totalPages: 0,
    number: 0
  });
  const [showPaymentsValidationError, setShowPaymentsValidationError] =
    useState(false);
  const [showFiltersValidationError, setShowFiltersValidationError] =
    useState(false);

  const updatePaymentsData = useCallback((data: PagedPaidInstallmentsDTO) => {
    // Force a new object to ensure re-render
    setPaymentsData({
      ...data,
      content: [...(data.content || [])]
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

  return {
    paymentsData,
    showPaymentsValidationError,
    showFiltersValidationError,
    updatePaymentsData,
    resetPaymentsData,
    setShowPaymentsValidationError,
    setShowFiltersValidationError,
    clearValidationErrors,
    hasPaymentsData: paymentsData.content.length > 0,
    totalPayments: paymentsData.totalElements
  };
};
