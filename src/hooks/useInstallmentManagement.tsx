/**
 * Hook for installment payment management
 * Improved version using reducer pattern
 */
import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldArray, Path, FieldValues, PathValue } from 'react-hook-form';
import { createAmountValidator } from '../utils/fieldValidation';
import {
  formatDate,
  parseAmountToNumber,
  formatAmountForDisplay
} from '../utils/formatters';
import {
  Installment,
  InstallmentManagementProps,
  InstallmentManagementResult,
  InstallmentValidators
} from '../models/paymentTypes';

/**
 * Internal hook state
 */
type InstallmentState = {
  /** Registry of installments existing before submit */
  existingInstallments: Record<string, boolean>;
  /** Flag indicating if form was submitted */
  wasSubmitted: boolean;
  /** Last submission count when installments were registered */
  lastSubmissionCount: number;
  /** Flag indicating if initialization is in progress */
  isInitializing: boolean;
  /** Flag indicating if initialization is complete */
  hasInitialized: boolean;
  /** Last calculated total amount to prevent unnecessary updates */
  lastTotalAmount: string;
  /** Flag to prevent recursive updates */
  isUpdating: boolean;
};

/**
 * Actions for the reducer
 */
type InstallmentAction =
  | { type: 'MARK_SUBMITTED' }
  | {
      type: 'SET_EXISTING_INSTALLMENTS';
      installments: Record<string, boolean>;
      submissionCount: number;
    }
  | { type: 'START_INITIALIZING' }
  | { type: 'FINISH_INITIALIZING' }
  | { type: 'MARK_INITIALIZED' }
  | { type: 'SET_LAST_TOTAL_AMOUNT'; amount: string }
  | { type: 'START_UPDATING' }
  | { type: 'FINISH_UPDATING' };

/**
 * Reducer to centrally manage installment state
 */
function installmentReducer(
  state: InstallmentState,
  action: InstallmentAction
): InstallmentState {
  switch (action.type) {
    case 'MARK_SUBMITTED':
      return {
        ...state,
        wasSubmitted: true
      };
    case 'SET_EXISTING_INSTALLMENTS':
      return {
        ...state,
        existingInstallments: action.installments,
        lastSubmissionCount: action.submissionCount
      };
    case 'START_INITIALIZING':
      return {
        ...state,
        isInitializing: true
      };
    case 'FINISH_INITIALIZING':
      return {
        ...state,
        isInitializing: false
      };
    case 'MARK_INITIALIZED':
      return {
        ...state,
        hasInitialized: true
      };
    case 'SET_LAST_TOTAL_AMOUNT':
      return {
        ...state,
        lastTotalAmount: action.amount
      };
    case 'START_UPDATING':
      return {
        ...state,
        isUpdating: true
      };
    case 'FINISH_UPDATING':
      return {
        ...state,
        isUpdating: false
      };
    default:
      return state;
  }
}

/**
 * Improved hook for installment management
 * Uses useReducer for more predictable state management
 */
export function useInstallmentManagement<T extends FieldValues>(
  props: InstallmentManagementProps<T>
): InstallmentManagementResult {
  const {
    control,
    fieldNamePrefix,
    isSubmitted,
    getValues,
    trigger,
    flagMandatoryDueDate = true,
    onInstallmentsChange,
    submissionCount = 0
  } = props;

  const MIN_INSTALLMENTS = 2;
  const MAX_INSTALLMENTS = 12;
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(installmentReducer, {
    existingInstallments: {},
    wasSubmitted: false,
    lastSubmissionCount: 0,
    isInitializing: false,
    hasInitialized: false,
    lastTotalAmount: '',
    isUpdating: false
  });

  // Refs for compatibility with original API
  const wasSubmittedRef = useRef(state.wasSubmitted);
  const isInitializingRef = useRef(state.isInitializing);

  // Update refs when state changes
  useEffect(() => {
    wasSubmittedRef.current = state.wasSubmitted;
    isInitializingRef.current = state.isInitializing;
  }, [state.wasSubmitted, state.isInitializing]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  const validators: InstallmentValidators = {
    amount: createAmountValidator(t),
    dueDate: {
      required: flagMandatoryDueDate
        ? t('debtPositionCreateWizard.step3.installments.dueDate.required')
        : false
    }
  };

  /**
   * Get current data for all installments
   */
  const getInstallmentsData = useCallback((): Array<Installment> => {
    return fields.map((field, index) => {
      const installmentData = getValues(
        `${fieldNamePrefix}.${index}` as Path<T>
      );

      // If date is a Date object, format it before returning
      const dueDate = installmentData?.dueDate;

      // Get amount and format it if present
      const amount = installmentData?.amount;
      const formattedAmount = amount ? formatAmountForDisplay(amount) : '';

      return {
        ...installmentData,
        // Format date only if it's a Date object and valid
        dueDate:
          dueDate instanceof Date && !isNaN(dueDate.getTime())
            ? formatDate(dueDate.toISOString())
            : dueDate,
        // Use formatted value for amount
        amount: formattedAmount,
        id: field.id,
        isNew:
          !!wasSubmittedRef.current && !state.existingInstallments[field.id]
      } as Installment;
    });
  }, [fields, getValues, fieldNamePrefix, state.existingInstallments]);

  /**
   * Calculate total amount by summing all installments
   */
  const calculateTotalAmount = useCallback((): string => {
    return fields
      .reduce((total, _, index) => {
        const installmentData = getValues(
          `${fieldNamePrefix}.${index}` as Path<T>
        );
        const amount = installmentData?.amount as string | undefined;
        const amountValue = amount ? parseAmountToNumber(amount) || 0 : 0;
        return total + amountValue;
      }, 0)
      .toFixed(2);
  }, [fields, getValues, fieldNamePrefix]);

  /**
   * Add a new installment
   */
  const addInstallment = useCallback(() => {
    if (fields.length < MAX_INSTALLMENTS) {
      // Create a new simple installment with empty due date
      const newInstallment: Installment = {
        amount: '',
        dueDate: null, // Due date always empty by default
        remittance: '', // Empty remittance by default
        isMultibeneficiary: false
      };

      // Add the new installment to the form
      append(newInstallment as unknown as PathValue<T, typeof fieldNamePrefix>);

      // Update amounts and notify changes
      setTimeout(() => {
        const newTotalAmount = calculateTotalAmount();
        if (onInstallmentsChange) {
          const currentInstallments = getInstallmentsData();
          onInstallmentsChange(currentInstallments, newTotalAmount);
        }
      }, 0);
    }
  }, [
    fields.length,
    MAX_INSTALLMENTS,
    append,
    fieldNamePrefix,
    calculateTotalAmount,
    onInstallmentsChange,
    getInstallmentsData
  ]);

  /**
   * Remove installment at specified index
   */
  const removeInstallment = useCallback(
    (index: number) => {
      // Don't allow removal if only minimum required installments remain
      if (fields.length <= MIN_INSTALLMENTS) {
        return;
      }

      // Remove installment from form
      remove(index);

      // Update amounts and notify changes
      setTimeout(() => {
        const newTotalAmount = calculateTotalAmount();
        if (onInstallmentsChange) {
          const currentInstallments = getInstallmentsData();
          onInstallmentsChange(currentInstallments, newTotalAmount);
        }
      }, 0);
    },
    [
      fields.length,
      MIN_INSTALLMENTS,
      remove,
      calculateTotalAmount,
      onInstallmentsChange,
      getInstallmentsData
    ]
  );

  // Register existing installments on every new submit
  useEffect(() => {
    // Register installments if:
    // 1. Form is submitted AND
    // 2. (First submit OR submission count has increased since last registration)
    if (
      isSubmitted &&
      (!state.wasSubmitted || submissionCount > state.lastSubmissionCount)
    ) {
      // Store current state of installments
      const currentInstallments = fields.reduce<Record<string, boolean>>(
        (acc, field) => {
          acc[field.id] = true;
          return acc;
        },
        {}
      );

      // Update state
      dispatch({
        type: 'SET_EXISTING_INSTALLMENTS',
        installments: currentInstallments,
        submissionCount
      });
      dispatch({ type: 'MARK_SUBMITTED' });
    }
  }, [
    isSubmitted,
    fields,
    state.wasSubmitted,
    submissionCount,
    state.lastSubmissionCount
  ]);

  // Update validation when amounts change
  useEffect(() => {
    if (state.wasSubmitted) {
      fields.forEach((field, index) => {
        if (state.existingInstallments[field.id]) {
          trigger(`${fieldNamePrefix}.${index}` as Path<T>);
        }
      });
    }
  }, [
    trigger,
    fieldNamePrefix,
    fields,
    state.wasSubmitted,
    state.existingInstallments
  ]);

  // Initialize first two installments if none exist
  useEffect(() => {
    // Add explicit check on hasInitialized value
    // to ensure multiple installments aren't added
    if (fields.length === 0 && !state.hasInitialized) {
      // First ensure no other initializations can occur
      dispatch({ type: 'MARK_INITIALIZED' });
      // Then start initialization phase
      dispatch({ type: 'START_INITIALIZING' });
      try {
        // Check if there are already data in the form
        const formValue = getValues(fieldNamePrefix as unknown as Path<T>);
        if (Array.isArray(formValue) && formValue.length > 0) {
          dispatch({ type: 'FINISH_INITIALIZING' });
          return;
        }
        // Create two initial simple installments with empty due dates
        const firstInstallment: Installment = {
          amount: '',
          dueDate: null,
          remittance: '',
          isMultibeneficiary: false
        };
        const secondInstallment: Installment = {
          amount: '',
          dueDate: null,
          remittance: '',
          isMultibeneficiary: false
        };
        // Use append sequentially and synchronously
        append(
          firstInstallment as unknown as PathValue<T, typeof fieldNamePrefix>
        );
        append(
          secondInstallment as unknown as PathValue<T, typeof fieldNamePrefix>
        );
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        dispatch({ type: 'FINISH_INITIALIZING' });
      }
    }
  }, [fields.length, append, fieldNamePrefix, state.hasInitialized, getValues]);

  // Notify changes and calculate total - only for existing installments
  useEffect(() => {
    // Check if we're already updating to avoid cycles
    // or if we're initializing (in which case we don't want to notify)
    if (state.isUpdating || state.isInitializing) {
      return;
    }

    // Notify only if there are installments and we're not initializing
    if (onInstallmentsChange && fields.length > 0) {
      // Calculate new total
      const totalAmount = calculateTotalAmount();
      // Compare with last stored total to avoid unnecessary updates
      if (totalAmount !== state.lastTotalAmount) {
        // Set update flag to prevent recursive calls
        dispatch({ type: 'START_UPDATING' });
        // Update reference value
        dispatch({ type: 'SET_LAST_TOTAL_AMOUNT', amount: totalAmount });
        // Execute callback
        const currentInstallments = getInstallmentsData();
        onInstallmentsChange(currentInstallments, totalAmount);
        // Reset flag after completion
        dispatch({ type: 'FINISH_UPDATING' });
      }
    }
  }, [
    fields.length,
    onInstallmentsChange,
    calculateTotalAmount,
    getInstallmentsData,
    state.isInitializing,
    state.isUpdating,
    state.lastTotalAmount
  ]);

  return {
    fields,
    validators,
    existingInstallments: state.existingInstallments,
    MIN_INSTALLMENTS,
    MAX_INSTALLMENTS,
    wasSubmittedRef,
    isInitializingRef,
    addInstallment,
    removeInstallment,
    calculateTotalAmount,
    getInstallmentsData
  };
}
