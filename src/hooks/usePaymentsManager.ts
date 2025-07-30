import { useCallback, useEffect } from 'react';
import { useAlertManager } from './useAlertManager';
import type {
  UsePaymentsManagerParams,
  UsePaymentsManagerResult
} from '../models/PaymentsManager';

/**
 * Hook unified for Payment selection + Alert coordination
 *
 * Responsibilities:
 * - Coordinates useAlertManager and usePaymentSelection
 * - Maintains compatibility with useStep2PaymentsState
 * - Handles synchronization with globalSelection
 * - Exposes clean API for the component
 *
 * @param shouldLoadData - If the component should load data
 * @param selectedPayments - Array of selected payments from the form
 * @param paymentsValidationError - Payment validation error state
 * @param filtersValidationError - Filters validation error state
 * @param onPaymentsValidationChange - Callback for payment validation changes
 * @param onFiltersValidationChange - Callback for filters validation changes
 * @param totalSelected - Total number of selected items (from globalSelection)
 * @returns Unified API for alert and selection management
 */
export const usePaymentsManager = ({
  paymentsValidationError,
  onPaymentsValidationChange,
  onFiltersValidationChange,
  totalSelected = 0
}: UsePaymentsManagerParams): UsePaymentsManagerResult => {
  const alertManager = useAlertManager();

  // 🔄 Handle payment validation errors - solo quando NON ci sono selezioni
  useEffect(() => {
    if (paymentsValidationError && totalSelected === 0) {
      alertManager.showAlert('error');
    } else if (totalSelected > 0) {
      // Se ci sono selezioni, mostra info e nascondi error
      alertManager.showAlert('info');
    } else if (!paymentsValidationError && totalSelected === 0) {
      // Nessun errore e nessuna selezione
      alertManager.hideAlert();
    }
  }, [
    paymentsValidationError,
    totalSelected,
    alertManager.showAlert,
    alertManager.hideAlert
  ]);

  // Auto-hide validation error when there are selections
  useEffect(() => {
    if (totalSelected > 0 && paymentsValidationError) {
      onPaymentsValidationChange(false);
    }
  }, [totalSelected, paymentsValidationError, onPaymentsValidationChange]);

  const showValidationError = useCallback(
    (show: boolean) => {
      onPaymentsValidationChange(show);
      if (show) {
        alertManager.showAlert('error');
      } else {
        alertManager.hideAlert();
      }
    },
    [onPaymentsValidationChange, alertManager.showAlert, alertManager.hideAlert]
  );

  const showFilterValidationError = useCallback(
    (show: boolean) => {
      onFiltersValidationChange(show);
    },
    [onFiltersValidationChange]
  );

  const clearAllSelections = useCallback(() => {
    alertManager.hideAlert();
  }, [alertManager.hideAlert]);

  const clearAllAlerts = useCallback(() => {
    alertManager.clearAllAlerts();
  }, [alertManager.clearAllAlerts]);

  const hideAlert = useCallback(() => {
    alertManager.hideAlert();
  }, [alertManager.hideAlert]);

  const showAlert = useCallback(
    (type: 'error' | 'info') => {
      alertManager.showAlert(type);
    },
    [alertManager.showAlert]
  );

  return {
    alertState: alertManager.alertState,
    shouldShowErrorAlert: alertManager.shouldShowErrorAlert,
    shouldShowInfoAlert: alertManager.shouldShowInfoAlert,
    showValidationError,
    showFilterValidationError,
    clearAllSelections,
    clearAllAlerts,
    hideAlert,
    showAlert
  };
};
