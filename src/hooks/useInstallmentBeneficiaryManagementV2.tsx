/**
 * Hook specializzato per la gestione dei beneficiari all'interno delle rate
 * Versione migliorata che utilizza il pattern reducer e si basa su useBeneficiaryManagementV2
 */
import { useCallback, useEffect, useRef } from 'react';
import { FieldValues, Path, FieldArrayPath, PathValue } from 'react-hook-form';
import { useBeneficiaryManagementV2 } from './useBeneficiaryManagementV2';
import {
  InstallmentBeneficiaryManagementProps,
  InstallmentBeneficiaryManagementResult
} from '../models/paymentTypes';

/**
 * Hook per la gestione dei beneficiari all'interno di una rata
 * Estende useBeneficiaryManagementV2 con funzionalità specifiche per le rate
 *
 * @param props Proprietà per l'hook di gestione beneficiari in una rata
 * @returns Metodi e proprietà per gestire i beneficiari in una rata
 */
export function useInstallmentBeneficiaryManagementV2<T extends FieldValues>(
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

  // Riferimento all'ultimo valore dell'importo per evitare validazioni inutili
  const lastAmountRef = useRef<string>('');

  // Costruisci il path per i beneficiari di questa rata
  const beneficiariesFieldNamePrefix =
    `${installmentsFieldNamePrefix}.${index}.beneficiaries` as FieldArrayPath<T>;

  // Ottieni l'importo della rata per la validazione dei beneficiari
  const installmentAmountPath =
    `${installmentsFieldNamePrefix}.${index}.amount` as Path<T>;
  const installmentAmount = getValues(installmentAmountPath) || '';

  // Verifica se è visibile lo switch per i beneficiari multipli
  const isMultibeneficiaryPath =
    `${installmentsFieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>;
  const isMultibeneficiary = !!getValues(isMultibeneficiaryPath);

  // Utilizziamo l'hook base per la gestione dei beneficiari
  const beneficiaryManagement = useBeneficiaryManagementV2<T>({
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
   * Attiva/disattiva la modalità multibeneficiario per questa rata
   */
  const toggleMultibeneficiary = useCallback(
    (value: boolean) => {
      console.log(
        '[DEBUG-TOGGLE] Inizio toggleMultibeneficiary, value:',
        value
      );

      // Aggiorniamo il valore nel form
      setValue(isMultibeneficiaryPath, value as PathValue<T, Path<T>>);

      // Se stiamo disattivando il multibeneficiario, resettiamo i beneficiari
      if (!value) {
        console.log(
          '[DEBUG-TOGGLE] Disattivazione multibeneficiario, reset beneficiari'
        );
        beneficiaryManagement.resetAllBeneficiaries();
      } else {
        // Se stiamo attivando il multibeneficiario, aggiungiamo un beneficiario di default
        console.log('[DEBUG-TOGGLE] Attivazione multibeneficiario');

        // Prima impostiamo un array vuoto per essere sicuri che sia inizializzato correttamente
        // Nota: qui uso direttamente il setValue anziché affidarmi a verifiche complesse
        const beneficiariesPath =
          `${installmentsFieldNamePrefix}.${index}.beneficiaries` as Path<T>;
        console.log('[DEBUG-TOGGLE] Path beneficiari:', beneficiariesPath);

        // Inizializza con un array vuoto per sicurezza
        setValue(beneficiariesPath, [] as unknown as PathValue<T, Path<T>>, {
          shouldDirty: true
        });

        // Inizializza immediatamente con un nuovo beneficiario per avere risposta immediata
        // anziché aspettare l'effetto di inizializzazione dell'hook
        const newBeneficiary = {
          entityName: '',
          amount: '',
          taxCode: '',
          iban: '',
          postalAccount: '',
          taxonomyCode: '',
          isNew: true // Aggiunto esplicitamente il flag isNew per evitare validazione immediata
        };

        console.log(
          '[DEBUG-TOGGLE] Aggiungo immediatamente un beneficiario usando setValue'
        );

        // Aggiorniamo il valore direttamente per garantire un rendering immediato
        setValue(
          beneficiariesPath,
          [newBeneficiary] as unknown as PathValue<T, Path<T>>,
          { shouldDirty: true }
        );

        // Facciamo il reset dello stato di validazione per evitare errori sui nuovi beneficiari
        // Aspettiamo un tick per assicurarci che il setValue sia stato elaborato
        setTimeout(() => {
          // Resettiamo lo stato di validazione per il nuovo beneficiario
          if (beneficiaryManagement.wasSubmittedRef.current) {
            // Aggiorniamo manualmente la lista dei beneficiari esistenti per escludere questo nuovo beneficiario dalla validazione
            const currentBeneficiari = getValues(beneficiariesPath);
            if (
              Array.isArray(currentBeneficiari) &&
              currentBeneficiari.length > 0
            ) {
              // Forziamo l'aggiornamento dello stato interno dell'hook
              setValue(
                beneficiariesPath,
                currentBeneficiari.map((b: Record<string, any>) => ({
                  ...b,
                  isNew: true
                })) as unknown as PathValue<T, Path<T>>,
                { shouldDirty: true }
              );
            }
          }
        }, 0);
      }

      // Chiamiamo il callback passato come prop se presente
      if (onToggleMultibeneficiary) {
        console.log(
          '[DEBUG-TOGGLE] Chiamata callback onToggleMultibeneficiary'
        );
        onToggleMultibeneficiary(value);
      }

      console.log('[DEBUG-TOGGLE] Fine toggleMultibeneficiary');
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
   * Valida gli importi dei beneficiari per questa rata
   */
  const validateBeneficiaryAmounts = useCallback(() => {
    const currentAmount = getValues(installmentAmountPath) || '';

    // Validazione solo se l'importo è cambiato
    if (currentAmount !== lastAmountRef.current) {
      lastAmountRef.current = currentAmount;
      beneficiaryManagement.updateAmountValidations();
    }
  }, [getValues, installmentAmountPath, beneficiaryManagement]);

  /**
   * Gestisce il cambio dell'importo della rata
   */
  const handleInstallmentAmountChange = useCallback(
    (value: string) => {
      // Aggiorniamo l'importo della rata
      setValue(installmentAmountPath, value as PathValue<T, Path<T>>);
      // Aggiorniamo la validazione degli importi dei beneficiari
      validateBeneficiaryAmounts();
    },
    [setValue, installmentAmountPath, validateBeneficiaryAmounts]
  );

  /**
   * Valida i campi di pagamento (IBAN e conto postale)
   */
  const validatePaymentFields = useCallback(() => {
    if (!isMultibeneficiary) return;

    // Utilizziamo un cast di tipo per evitare errori di tipizzazione con getValues
    // Otteniamo l'array di beneficiari in modo sicuro
    const beneficiariesPath =
      `${installmentsFieldNamePrefix}.${index}.beneficiaries` as Path<T>;
    const currentBeneficiaries = getValues(beneficiariesPath) as unknown[];

    if (
      Array.isArray(currentBeneficiaries) &&
      currentBeneficiaries.length > 0
    ) {
      currentBeneficiaries.forEach((_: unknown, beneficiaryIndex: number) => {
        // Trigger validazione IBAN
        trigger(
          `${beneficiariesFieldNamePrefix}.${beneficiaryIndex}.iban` as Path<T>
        );
        // Trigger validazione conto postale
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

  // Effetto per la validazione quando cambia l'importo della rata
  useEffect(() => {
    if (isMultibeneficiary && installmentAmount) {
      validateBeneficiaryAmounts();
    }
  }, [isMultibeneficiary, installmentAmount, validateBeneficiaryAmounts]);

  return {
    // Proprietà e metodi dell'hook di base
    ...beneficiaryManagement,

    // Proprietà e metodi specifici per i beneficiari nelle rate
    isMultibeneficiary,
    toggleMultibeneficiary,
    validateBeneficiaryAmounts,
    handleInstallmentAmountChange,
    validatePaymentFields
  };
}
