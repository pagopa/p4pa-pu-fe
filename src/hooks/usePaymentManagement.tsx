/**
 * Hook principale per la gestione centralizzata dei pagamenti
 * Coordina i diversi hook specializzati per i vari tipi di pagamento
 */
import { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  PaymentConfiguration,
  PaymentOption,
  PaymentFormValues,
  Beneficiary
} from '../models/paymentTypes';
import { useBeneficiaryManagement } from './useBeneficiaryManagement';
import { useInstallmentManagement } from './useInstallmentManagement';
import { formatDate } from '../utils/formatters';

/**
 * Type per i risultati dell'hook
 */
type PaymentManagementResult = {
  formMethods: ReturnType<typeof useForm<PaymentFormValues>>;
  paymentOption: PaymentOption;
  isMultibeneficiary: boolean;
  totalAmount: string;
  beneficiaries?: {
    fields: Array<Record<string, unknown>>;
    addBeneficiary: () => void;
    removeBeneficiary: (index: number) => void;
    resetAllBeneficiaries: () => void;
  };
  installments?: {
    fields: Array<Record<string, unknown>>;
    addInstallment: () => void;
    removeInstallment: (index: number) => void;
    calculateTotalAmount: () => string;
  };
  prepareSubmitData: () => PaymentConfiguration;
  validatePaymentData: () => boolean;
};

/**
 * Hook centralizzato per la gestione dei pagamenti
 * Coordina le funzionalità di pagamento unico e rateale
 *
 * @param initialData Configurazione iniziale del pagamento
 * @returns Metodi e proprietà per gestire il pagamento
 */
export function usePaymentManagement(
  initialData: PaymentConfiguration
): PaymentManagementResult {
  const formMethods = useForm<PaymentFormValues>({
    defaultValues: initialData as unknown as PaymentFormValues,
    mode: 'onChange'
  });

  const {
    watch,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors, isSubmitted }
  } = formMethods;

  const paymentOption = watch('paymentOption.value');

  const isMultibeneficiary = watch('isMultibeneficiary.value');

  const totalAmount = watch('amount.value') || '';

  const initializedRef = useRef(false);

  const beneficiaryManagement = useBeneficiaryManagement({
    control,
    fieldNamePrefix: 'beneficiaries',
    isSubmitted,
    getValues,
    trigger,
    totalAmount,
    onToggleMultibeneficiary: (value) => {
      setValue('isMultibeneficiary.value', value);
    }
  });

  const installmentManagement = useInstallmentManagement({
    control,
    fieldNamePrefix: 'installments',
    isSubmitted,
    getValues,
    setValue,
    trigger,
    flagMandatoryDueDate: initialData.flagMandatoryDueDate,
    onInstallmentsChange: (_unused, totalAmount) => {
      setValue('amount.value', totalAmount);
    }
  });

  /**
   * Gestisce il cambio del tipo di pagamento
   */
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (paymentOption === 'INSTALLMENTS') {
      if (isMultibeneficiary) {
        setValue('isMultibeneficiary.value', false);

        if (beneficiaryManagement.resetAllBeneficiaries) {
          beneficiaryManagement.resetAllBeneficiaries();
        }
      }

      setValue('amount.value', '');
    } else if (paymentOption === 'SINGLE') {
      if (installmentManagement.fields.length > 0) {
        setValue('amount.value', '');
      }
    }
  }, [
    paymentOption,
    isMultibeneficiary,
    setValue,
    beneficiaryManagement,
    installmentManagement.fields.length
  ]);

  /**
   * Valida i dati di pagamento prima del submit
   * Controlla che tutti i campi richiesti siano valorizzati correttamente
   */
  const validatePaymentData = useCallback((): boolean => {
    trigger(['paymentObject.value', 'paymentOption.value', 'amount.value']);

    if (paymentOption === 'SINGLE') {
      if (initialData.flagMandatoryDueDate) {
        trigger('dueDate.value');
      }

      if (isMultibeneficiary) {
        beneficiaryManagement.updateAmountValidations();
      }
    } else if (paymentOption === 'INSTALLMENTS') {
      installmentManagement.fields.forEach((_, index) => {
        trigger(`installments.${index}.amount`);
        trigger(`installments.${index}.dueDate`);
      });
    }

    return !Object.keys(errors).length;
  }, [
    trigger,
    paymentOption,
    isMultibeneficiary,
    initialData.flagMandatoryDueDate,
    beneficiaryManagement,
    installmentManagement.fields,
    errors
  ]);

  /**
   * Prepara i dati per il submit
   */
  const prepareSubmitData = useCallback((): PaymentConfiguration => {
    const formValues = getValues();

    const formattedValues: PaymentConfiguration = {
      ...formValues,
      dueDate: {
        ...formValues.dueDate,
        value:
          formValues.dueDate.value instanceof Date
            ? formatDate(formValues.dueDate.value.toISOString())
            : formValues.dueDate.value
      },
      flagMandatoryDueDate: initialData.flagMandatoryDueDate
    };

    if (paymentOption === 'SINGLE' && isMultibeneficiary) {
      const currentBeneficiaries = beneficiaryManagement.fields.map(
        (_, index) => {
          return getValues(`beneficiaries.${index}`) as Beneficiary;
        }
      );

      formattedValues.beneficiaries = currentBeneficiaries;
    }

    if (paymentOption === 'INSTALLMENTS') {
      formattedValues.installments =
        installmentManagement.getInstallmentsData();
    }

    return formattedValues;
  }, [
    getValues,
    initialData.flagMandatoryDueDate,
    paymentOption,
    isMultibeneficiary,
    beneficiaryManagement.fields,
    installmentManagement.getInstallmentsData
  ]);

  return {
    formMethods,

    paymentOption,
    isMultibeneficiary,
    totalAmount,

    ...(paymentOption === 'SINGLE' && isMultibeneficiary
      ? {
          beneficiaries: {
            fields: beneficiaryManagement.fields,
            addBeneficiary: beneficiaryManagement.addBeneficiary,
            removeBeneficiary: beneficiaryManagement.removeBeneficiary,
            resetAllBeneficiaries: beneficiaryManagement.resetAllBeneficiaries
          }
        }
      : {}),

    ...(paymentOption === 'INSTALLMENTS'
      ? {
          installments: {
            fields: installmentManagement.fields,
            addInstallment: installmentManagement.addInstallment,
            removeInstallment: installmentManagement.removeInstallment,
            calculateTotalAmount: installmentManagement.calculateTotalAmount
          }
        }
      : {}),

    prepareSubmitData,
    validatePaymentData
  };
}
