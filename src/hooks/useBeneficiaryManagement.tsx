/**
 * @description Simplified beneficiary management hook
 * @summary Facilitates the addition, removal and validation of beneficiaries for payments with multiple recipients
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldArray, Path, FieldValues, PathValue } from 'react-hook-form';
import {
  createBeneficiaryValidators,
  createBeneficiaryFieldValidators
} from '../utils/fieldValidation';
import {
  Beneficiary,
  BeneficiaryManagementProps,
  BeneficiaryManagementResult
} from '../models/paymentTypes';

/**
 * @description Simplified version of the beneficiary management hook
 * @summary Uses a more declarative approach and minimizes states
 */
export function useBeneficiaryManagement<T extends FieldValues>(
  props: BeneficiaryManagementProps<T>
): BeneficiaryManagementResult {
  const {
    control,
    fieldNamePrefix,
    isSubmitted,
    getValues,
    trigger,
    totalAmount,
    onToggleMultibeneficiary,
    onBeneficiariesChange,
    isInsideInstallment = false,
    installmentIndex,
    setValue
  } = props;

  /** Constants */
  const MAX_BENEFICIARIES = 4;
  const { t } = useTranslation();

  /** State & Refs */
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<
    Record<string, boolean>
  >({});
  const [initialized, setInitialized] = useState(false);

  const wasSubmittedRef = useRef(false);
  const isInitializingRef = useRef(false);

  /** Field Array */
  const fieldArray = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  const { fields, append, remove } = fieldArray;

  /** Validators */
  const validators = createBeneficiaryValidators(
    t,
    getValues,
    fieldNamePrefix,
    totalAmount
  );

  const fieldValidators = createBeneficiaryFieldValidators(t);

  /** Utility Functions */

  /**
   * @description Gets the complete path of a field
   * @param {number} index - The beneficiary index
   * @param {string} [field] - Optional field name
   * @returns {Path<U>} The complete form path
   */
  const getBeneficiaryPath = useCallback(
    <U extends FieldValues>(index: number, field?: string): Path<U> => {
      const path = field
        ? `${fieldNamePrefix}.${index}.${field}`
        : `${fieldNamePrefix}.${index}`;
      return path as unknown as Path<U>;
    },
    [fieldNamePrefix]
  );

  /**
   * @description Gets a summary of beneficiaries with additional information
   * @returns {Array} Array of beneficiary summaries
   */
  const getBeneficiariesSummary = useCallback(() => {
    return fields.map((field, index) => {
      const dati = getValues(getBeneficiaryPath<T>(index)) || {};

      /** A beneficiary is new if added after initial submit OR has isNew=true flag */
      const isNew =
        (wasSubmittedRef.current && !existingBeneficiaries[field.id]) ||
        (dati as Record<string, unknown>)?.isNew === true;

      if (dati && typeof dati === 'object' && 'id' in dati) {
        (dati as Record<string, unknown>).id = field.id;
      }

      return {
        id: field.id,
        index,
        isNew,
        dati,
        validazioneApplicata: wasSubmittedRef.current && !isNew
      };
    });
  }, [
    fields,
    getValues,
    getBeneficiaryPath,
    existingBeneficiaries,
    wasSubmittedRef
  ]);

  /**
   * @description Updates validation for all amount fields
   */
  const updateAmountValidations = useCallback(() => {
    fields.forEach((_, index) => {
      trigger(getBeneficiaryPath<T>(index, 'amount'));
    });

    /** If inside an installment, also trigger validation for the installment itself */
    if (isInsideInstallment && installmentIndex !== undefined) {
      const installmentPath = fieldNamePrefix.split('.').slice(0, 2).join('.');
      trigger(`${installmentPath}.amount` as Path<T>);
    }
  }, [
    fields,
    trigger,
    getBeneficiaryPath,
    isInsideInstallment,
    installmentIndex,
    fieldNamePrefix
  ]);

  /** Beneficiary Management */

  /**
   * @description Adds a new beneficiary
   */
  const addBeneficiary = useCallback(() => {
    if (fields.length < MAX_BENEFICIARIES) {
      const newBeneficiary: Beneficiary = {
        entityName: '',
        taxCode: '',
        remittance: '',
        amount: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        isNew: true
      };

      append(newBeneficiary as unknown as PathValue<T, typeof fieldNamePrefix>);

      setTimeout(() => {
        if (onBeneficiariesChange) {
          onBeneficiariesChange(getBeneficiariesSummary());
        }
      }, 0);
    }
  }, [
    fields.length,
    append,
    fieldNamePrefix,
    onBeneficiariesChange,
    getBeneficiariesSummary
  ]);

  /**
   * @description Removes all beneficiaries
   */
  const resetAllBeneficiaries = useCallback(() => {
    const fieldsLength = fields.length;
    for (let i = fieldsLength - 1; i >= 0; i--) {
      remove(i);
    }

    setExistingBeneficiaries({});

    if (onBeneficiariesChange) {
      onBeneficiariesChange([]);
    }
  }, [fields, remove, onBeneficiariesChange]);

  /**
   * @description Removes a specific beneficiary
   * @summary Simplified version with cleaner removal handling
   * @param {number} index - The index of the beneficiary to remove
   */
  const removeBeneficiary = useCallback(
    (index: number) => {
      /** If only one beneficiary remains, disable multi-beneficiary */
      const remainingBeneficiaries = fields.length - 1;
      const shouldDisableMultibeneficiary =
        remainingBeneficiaries === 0 && onToggleMultibeneficiary;

      if (shouldDisableMultibeneficiary) {
        resetAllBeneficiaries();
        onToggleMultibeneficiary(false);
        return;
      }

      /** If setValue is available, use the more reliable approach */
      if (setValue) {
        const currentValues = getValues(`${fieldNamePrefix}` as Path<T>);

        if (Array.isArray(currentValues)) {
          const updatedValues = [...currentValues];
          updatedValues.splice(index, 1);

          setValue(
            fieldNamePrefix as unknown as Path<T>,
            updatedValues as unknown as PathValue<T, Path<T>>,
            { shouldDirty: true, shouldTouch: true, shouldValidate: true }
          );

          setTimeout(() => {
            updateAmountValidations();

            if (onBeneficiariesChange) {
              onBeneficiariesChange(getBeneficiariesSummary());
            }
          }, 50);

          return;
        }
      }

      /** Fallback to standard method if setValue isn't available */
      remove(index);

      setTimeout(() => {
        updateAmountValidations();

        if (onBeneficiariesChange) {
          onBeneficiariesChange(getBeneficiariesSummary());
        }
      }, 50);
    },
    [
      fields,
      onToggleMultibeneficiary,
      resetAllBeneficiaries,
      setValue,
      getValues,
      fieldNamePrefix,
      updateAmountValidations,
      onBeneficiariesChange,
      getBeneficiariesSummary,
      remove
    ]
  );

  /** Effects */

  /**
   * @description Register existing beneficiaries on first submit
   */
  useEffect(() => {
    if (isSubmitted && !wasSubmittedRef.current) {
      const currentBeneficiaries = fields.reduce<Record<string, boolean>>(
        (acc, field) => {
          acc[field.id] = true;
          return acc;
        },
        {}
      );

      setExistingBeneficiaries(currentBeneficiaries);
      wasSubmittedRef.current = true;
    }
  }, [isSubmitted, fields]);

  /**
   * @description Update validation when amounts or beneficiaries change
   */
  useEffect(() => {
    if (wasSubmittedRef.current) {
      fields.forEach((field, index) => {
        const beneficiaryData = getValues(getBeneficiaryPath<T>(index));
        const isNewBeneficiary = beneficiaryData?.isNew === true;

        /** Apply validation only to existing beneficiaries and not to new ones */
        if (existingBeneficiaries[field.id] && !isNewBeneficiary) {
          trigger(getBeneficiaryPath<T>(index));
        }
      });
    }
  }, [
    trigger,
    fields,
    totalAmount,
    existingBeneficiaries,
    getBeneficiaryPath,
    getValues
  ]);

  /**
   * @description Initialize first beneficiary if none exists
   */
  useEffect(() => {
    if (fields.length === 0 && !initialized && !isInitializingRef.current) {
      /** Check if values already exist in the field, without using try/catch */
      const currentValue = getValues(fieldNamePrefix as unknown as Path<T>);
      if (
        currentValue &&
        Array.isArray(currentValue) &&
        currentValue.length > 0
      ) {
        setInitialized(true);
        return;
      }

      setInitialized(true);
      isInitializingRef.current = true;
      addBeneficiary();
      isInitializingRef.current = false;
    }
  }, [fields.length, initialized, addBeneficiary, getValues, fieldNamePrefix]);

  /**
   * @description Notify beneficiary changes
   */
  useEffect(() => {
    if (
      onBeneficiariesChange &&
      fields.length > 0 &&
      !isInitializingRef.current
    ) {
      onBeneficiariesChange(getBeneficiariesSummary());
    }
  }, [fields, onBeneficiariesChange, getBeneficiariesSummary]);

  return {
    fields,
    validators,
    fieldValidators,
    MAX_BENEFICIARIES,
    existingBeneficiaries,
    wasSubmittedRef,
    isInitializingRef,
    addBeneficiary,
    removeBeneficiary,
    resetAllBeneficiaries,
    updateAmountValidations,
    getBeneficiaryPath
  };
}
