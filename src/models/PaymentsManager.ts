/**
 * Types and interfaces for Step2Payments refactor
 */

import type { Control } from 'react-hook-form';

export type AssessmentFormData = {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  selectedPaymentIuds?: Array<string>;
  selectedAssessmentDetailIds?: Array<number>;
  operatingYear?: string;
  chapterCode?: string;
  debtPositionTypeOrgCode?: string;
  isModifyMode?: boolean;
  modifyAction?: 'add' | 'remove';
  assessmentId?: number;
};

export type AlertState = 'none' | 'error' | 'info';

export type PaymentsManagerState = {
  alertState: AlertState;
  paymentsValidationError: boolean;
  filtersValidationError: boolean;
};

export type PaymentsManagerActions = {
  showValidationError: (show: boolean) => void;
  showFilterValidationError: (show: boolean) => void;
  clearAllSelections: () => void;
  clearAllAlerts: () => void;
};

export type UseAlertManagerResult = {
  alertState: AlertState;
  shouldShowErrorAlert: boolean;
  shouldShowInfoAlert: boolean;
  showAlert: (type: 'error' | 'info') => void;
  hideAlert: () => void;
  clearAllAlerts: () => void;
};

export type UsePaymentSelectionParams = {
  initialSelected?: Array<string>;
};

export type UsePaymentSelectionResult = {
  selectedPayments: Array<string>;
  selectedCount: number;
  toggleSelection: (paymentIds: Array<string>) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  hasSelections: boolean;
};

/**
 * Unified hook for alert and selection management
 *
 * Integrates useAlertManager with existing validation logic,
 * providing a clean API for Step2Payments
 */
export type UsePaymentsManagerResult = {
  alertState: AlertState;
  shouldShowErrorAlert: boolean;
  shouldShowInfoAlert: boolean;

  // Compatibility methods (called by AssessmentCreate via Step2PaymentsRef)
  showValidationError: (show: boolean) => void;
  showFilterValidationError: (show: boolean) => void;
  clearAllSelections: () => void;
  clearAllAlerts: () => void;
  hideAlert: () => void;
  showAlert: (type: 'error' | 'info') => void;
};

export type Step2PaymentsRef = {
  showValidationError: (show: boolean) => void;
  showFilterValidationError: (show: boolean) => void;
};

export type Step2PaymentsProps = {
  isActive?: boolean;
};

export type FormDependencies = {
  control: Control<AssessmentFormData>;
  setValue: (name: string, value: unknown) => void;
  selectedPayments?: Array<string>;
  addPaymentsToAssessment?: boolean;
  debtPositionTypeOrgCode?: string;
  isModifyMode?: boolean;
  modifyAction?: 'add' | 'remove';
  assessmentId?: number;
};

export type UsePaymentsManagerParams = {
  shouldLoadData: boolean;
  selectedPayments?: Array<string>;
  paymentsValidationError: boolean;
  filtersValidationError: boolean;
  onPaymentsValidationChange: (show: boolean) => void;
  onFiltersValidationChange: (show: boolean) => void;
  totalSelected?: number;
};
