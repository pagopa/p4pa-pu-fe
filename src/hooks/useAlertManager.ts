import { useState, useCallback } from 'react';
import type {
  AlertState,
  UseAlertManagerResult
} from '../models/PaymentsManager';

/**
 * Hook for centralized alert management
 * Eliminates flickering between red and blue alerts
 */
export const useAlertManager = (): UseAlertManagerResult => {
  const [alertState, setAlertState] = useState<AlertState>('none');

  /**
   * Show an alert with managed priority
   * Error alert always takes precedence over info alert
   * But info can replace error when explicitly requested
   */
  const showAlert = useCallback((type: 'error' | 'info') => {
    setAlertState(type);
  }, []);

  /**
   * Hide the current alert
   */
  const hideAlert = useCallback(() => {
    setAlertState('none');
  }, []);

  /**
   * Clear all alerts (for reset/clear)
   */
  const clearAllAlerts = useCallback(() => {
    setAlertState('none');
  }, []);

  return {
    alertState,
    shouldShowErrorAlert: alertState === 'error',
    shouldShowInfoAlert: alertState === 'info',
    showAlert,
    hideAlert,
    clearAllAlerts
  };
};
