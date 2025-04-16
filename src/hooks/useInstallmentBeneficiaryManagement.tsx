/**
 * Specialized hook for managing beneficiaries within installments
 * Improved version using reducer pattern based on useBeneficiaryManagement
 */
import { useCallback, useEffect, useRef } from 'react';
import { FieldValues, Path, FieldArrayPath, PathValue } from 'react-hook-form';
import { useBeneficiaryManagement } from './useBeneficiaryManagement';
import {
  InstallmentBeneficiaryManagementProps,
  InstallmentBeneficiaryManagementResult
} from '../models/paymentTypes';

/**
 * Hook for managing beneficiaries within an installment
 * Extends useBeneficiaryManagement with installment-specific functionality
 *
 * @param props Properties for the beneficiary management hook in an installment
 * @returns Methods and properties for managing beneficiaries in an installment
 */
export function useInstallmentBeneficiaryManagement<T extends FieldValues>(
  props: InstallmentBeneficiaryManagementProps<T>
): InstallmentBeneficiaryManagementResult {
  const {
    control,
    index,
    installmentsFieldNamePrefix,
    isSubmitted,
    getValues,
    setValue,
    trigger,
    onToggleMultibeneficiary
  } = props;

  const lastAmountRef = useRef<string>('');

  const beneficiariesFieldNamePrefix =
    `${installmentsFieldNamePrefix}.${index}.beneficiaries` as FieldArrayPath<T>;

  const installmentAmountPath =
    `${installmentsFieldNamePrefix}.${index}.amount` as Path<T>;
  const installmentAmount = getValues(installmentAmountPath) || '';

  const isMultibeneficiaryPath =
    `${installmentsFieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>;
  const isMultibeneficiary = !!getValues(isMultibeneficiaryPath);

  const beneficiaryManagement = useBeneficiaryManagement<T>({
    control,
    fieldNamePrefix: beneficiariesFieldNamePrefix,
    isSubmitted,
    getValues,
    trigger,
    totalAmount: installmentAmount,
    onToggleMultibeneficiary,
    isInsideInstallment: true,
    installmentIndex: index,
    setValue
  });

  /**
   * Toggles multi-beneficiary mode for this installment
   */
  const toggleMultibeneficiary = useCallback(
    (value: boolean) => {
      setValue(isMultibeneficiaryPath, value as PathValue<T, Path<T>>);

      if (!value) {
        beneficiaryManagement.resetAllBeneficiaries();
      } else {
        const beneficiariesPath =
          `${installmentsFieldNamePrefix}.${index}.beneficiaries` as Path<T>;

        setValue(beneficiariesPath, [] as unknown as PathValue<T, Path<T>>, {
          shouldDirty: true
        });

        const newBeneficiary = {
          entityName: '',
          amount: '',
          taxCode: '',
          iban: '',
          postalAccount: '',
          taxonomyCode: '',
          isNew: true
        };

        setValue(
          beneficiariesPath,
          [newBeneficiary] as unknown as PathValue<T, Path<T>>,
          { shouldDirty: true }
        );

        setTimeout(() => {
          if (beneficiaryManagement.wasSubmittedRef.current) {
            const currentBeneficiari = getValues(beneficiariesPath);
            if (
              Array.isArray(currentBeneficiari) &&
              currentBeneficiari.length > 0
            ) {
              setValue(
                beneficiariesPath,
                currentBeneficiari.map((b: Record<string, unknown>) => ({
                  ...b,
                  isNew: true
                })) as unknown as PathValue<T, Path<T>>,
                { shouldDirty: true }
              );
            }
          }
        }, 0);
      }

      if (onToggleMultibeneficiary) {
        onToggleMultibeneficiary(value);
      }
    },
    [
      setValue,
      isMultibeneficiaryPath,
      beneficiaryManagement,
      onToggleMultibeneficiary,
      installmentsFieldNamePrefix,
      index,
      getValues
    ]
  );

  /**
   * Validates beneficiary amounts for this installment
   */
  const validateBeneficiaryAmounts = useCallback(() => {
    const currentAmount = getValues(installmentAmountPath) || '';

    if (currentAmount !== lastAmountRef.current) {
      lastAmountRef.current = currentAmount;
      beneficiaryManagement.updateAmountValidations();
    }
  }, [getValues, installmentAmountPath, beneficiaryManagement]);

  /**
   * Handles installment amount changes
   */
  const handleInstallmentAmountChange = useCallback(
    (value: string) => {
      setValue(installmentAmountPath, value as PathValue<T, Path<T>>);
      validateBeneficiaryAmounts();
    },
    [setValue, installmentAmountPath, validateBeneficiaryAmounts]
  );

  /**
   * Validates payment fields (IBAN and postal account)
   */
  const validatePaymentFields = useCallback(() => {
    if (!isMultibeneficiary) return;

    const beneficiariesPath =
      `${installmentsFieldNamePrefix}.${index}.beneficiaries` as Path<T>;
    const currentBeneficiaries = getValues(beneficiariesPath) as Array<unknown>;

    if (
      Array.isArray(currentBeneficiaries) &&
      currentBeneficiaries.length > 0
    ) {
      currentBeneficiaries.forEach((_: unknown, beneficiaryIndex: number) => {
        trigger(
          `${beneficiariesFieldNamePrefix}.${beneficiaryIndex}.iban` as Path<T>
        );
        trigger(
          `${beneficiariesFieldNamePrefix}.${beneficiaryIndex}.postalAccount` as Path<T>
        );
      });
    }
  }, [
    trigger,
    installmentsFieldNamePrefix,
    index,
    beneficiariesFieldNamePrefix,
    getValues,
    isMultibeneficiary
  ]);

  useEffect(() => {
    if (isMultibeneficiary && installmentAmount) {
      validateBeneficiaryAmounts();
    }
  }, [isMultibeneficiary, installmentAmount, validateBeneficiaryAmounts]);

  return {
    ...beneficiaryManagement,
    isMultibeneficiary,
    toggleMultibeneficiary,
    validateBeneficiaryAmounts,
    handleInstallmentAmountChange,
    validatePaymentFields
  };
}
