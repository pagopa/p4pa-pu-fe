/**
 * Hook principale per la gestione centralizzata dei pagamenti
 * Coordina i diversi hook specializzati per i vari tipi di pagamento
 */
import { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PaymentConfiguration,
  PaymentOption,
  PaymentFormValues,
  Beneficiary
} from '../models/paymentTypes';
import { useBeneficiaryManagementV2 } from './useBeneficiaryManagementV2';
import { useInstallmentManagementV2 } from './useInstallmentManagementV2';
import { formatDate } from '../utils/formatters';

/**
 * Type per i risultati dell'hook
 */
type PaymentManagementResult = {
  // Metodi e stato di react-hook-form
  formMethods: ReturnType<typeof useForm<PaymentFormValues>>;
  // Stato del tipo di pagamento
  paymentOption: PaymentOption;
  isMultibeneficiary: boolean;
  totalAmount: string;
  // Funzionalità per gestione beneficiari (pagamento unico)
  beneficiaries?: {
    fields: Array<Record<string, unknown>>;
    addBeneficiary: () => void;
    removeBeneficiary: (index: number) => void;
    resetAllBeneficiaries: () => void;
  };
  // Funzionalità per gestione rate (pagamento rateale)
  installments?: {
    fields: Array<Record<string, unknown>>;
    addInstallment: () => void;
    removeInstallment: (index: number) => void;
    calculateTotalAmount: () => string;
  };
  // Metodi per il submit
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
  const { t } = useTranslation();

  // Inizializza il form con react-hook-form
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

  // Osserva il tipo di pagamento per adattare dinamicamente il comportamento
  const paymentOption = watch('paymentOption.value');

  // Traccia se il multibeneficiario è attivo (solo per pagamento unico)
  const isMultibeneficiary = watch('isMultibeneficiary.value');

  // Importo totale del pagamento
  const totalAmount = watch('amount.value') || '';

  // Riferimento per tracciare se è stata fatta l'inizializzazione
  const initializedRef = useRef(false);

  // ===== HOOK DI GESTIONE BENEFICIARI (PAGAMENTO UNICO) =====
  const beneficiaryManagement = useBeneficiaryManagementV2({
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

  // ===== HOOK DI GESTIONE RATE (PAGAMENTO RATEALE) =====
  const installmentManagement = useInstallmentManagementV2({
    control,
    fieldNamePrefix: 'installments',
    isSubmitted,
    getValues,
    setValue,
    trigger,
    flagMandatoryDueDate: initialData.flagMandatoryDueDate,
    onInstallmentsChange: (installments, totalAmount) => {
      // Aggiorna l'importo totale quando cambiano le rate
      setValue('amount.value', totalAmount);
    }
  });

  /**
   * Gestisce il cambio del tipo di pagamento
   */
  useEffect(() => {
    // Salta l'effetto durante l'inizializzazione
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    // Quando cambia il tipo di pagamento, dobbiamo adattare alcuni campi
    if (paymentOption === 'INSTALLMENTS') {
      // Se si passa a pagamento rateale, disattiva il multibeneficiario
      if (isMultibeneficiary) {
        setValue('isMultibeneficiary.value', false);

        // Resettiamo eventuali beneficiari esistenti
        if (beneficiaryManagement.resetAllBeneficiaries) {
          beneficiaryManagement.resetAllBeneficiaries();
        }
      }

      // Azzera l'importo totale che sarà calcolato dalla somma delle rate
      setValue('amount.value', '');
    } else if (paymentOption === 'SINGLE') {
      // Quando si torna a pagamento unico, resetta le rate
      if (installmentManagement.fields.length > 0) {
        // Resettiamo il valore dell'importo
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
    // Valida i campi di base del pagamento
    const baseFieldsValid = trigger([
      'paymentObject.value',
      'paymentOption.value',
      'amount.value'
    ]);

    // Se è un pagamento unico, valida anche la data di scadenza
    if (paymentOption === 'SINGLE') {
      if (initialData.flagMandatoryDueDate) {
        trigger('dueDate.value');
      }

      // Se è multibeneficiario, valida anche i beneficiari
      if (isMultibeneficiary) {
        // Valida tutti i campi dei beneficiari
        beneficiaryManagement.updateAmountValidations();
      }
    } else if (paymentOption === 'INSTALLMENTS') {
      // Valida tutte le rate
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

    // Converti la data in stringa prima di restituirla
    const formattedValues: PaymentConfiguration = {
      ...formValues,
      dueDate: {
        ...formValues.dueDate,
        value:
          formValues.dueDate.value instanceof Date
            ? formatDate(formValues.dueDate.value.toISOString())
            : formValues.dueDate.value
      },
      // Preserva flagMandatoryDueDate da initialData
      flagMandatoryDueDate: initialData.flagMandatoryDueDate
    };

    // Aggiungi array di beneficiari solo se è multibeneficiario e pagamento unico
    if (paymentOption === 'SINGLE' && isMultibeneficiary) {
      const currentBeneficiaries = beneficiaryManagement.fields.map(
        (field, index) => {
          return getValues(`beneficiaries.${index}`) as Beneficiary;
        }
      );

      formattedValues.beneficiaries = currentBeneficiaries;
    }

    // Aggiungi array di rate solo se è pagamento rateale
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
    // Espone i metodi di react-hook-form
    formMethods,

    // Espone lo stato del pagamento
    paymentOption,
    isMultibeneficiary,
    totalAmount,

    // Espone le funzionalità per la gestione dei beneficiari (solo per pagamento unico)
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

    // Espone le funzionalità per la gestione delle rate (solo per pagamento rateale)
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

    // Espone metodi per il submit
    prepareSubmitData,
    validatePaymentData
  };
}
