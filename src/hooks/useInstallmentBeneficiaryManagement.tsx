import { useCallback, useEffect } from 'react';
import {
  Control,
  FieldValues,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  Path,
  PathValue
} from 'react-hook-form';
import { useBeneficiaryManagement } from './useBeneficiaryManagement';

type UseInstallmentBeneficiaryManagementProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly index: number; // Indice dell'installment
  readonly installmentsFieldNamePrefix: string; // Prefisso del campo per le rate
  readonly isSubmitted: boolean;
  readonly getValues: UseFormGetValues<T>;
  readonly setValue: UseFormSetValue<T>;
  readonly trigger: UseFormTrigger<T>;
  readonly onToggleMultibeneficiary?: (value: boolean) => void;
};

/**
 * Hook specializzato per gestire i beneficiari all'interno di una rata
 * Estende useBeneficiaryManagement con funzionalità specifiche per le rate
 */
export function useInstallmentBeneficiaryManagement<T extends FieldValues>({
  control,
  index,
  installmentsFieldNamePrefix,
  isSubmitted,
  getValues,
  setValue,
  trigger,
  onToggleMultibeneficiary
}: UseInstallmentBeneficiaryManagementProps<T>) {
  // Costruisci il path per i beneficiari di questa rata
  const beneficiariesPrefix =
    `${installmentsFieldNamePrefix}.${index}.beneficiaries` as any;

  // Ottieni l'importo della rata per la validazione dei beneficiari
  const installmentAmount =
    getValues(`${installmentsFieldNamePrefix}.${index}.amount` as Path<T>) ||
    '';

  // Verifica se è visibile lo switch per i beneficiari multipli
  const isMultibeneficiary = !!getValues(
    `${installmentsFieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>
  );

  // Utilizziamo l'hook base per la gestione dei beneficiari
  const beneficiaryManagement = useBeneficiaryManagement<T>({
    control,
    fieldNamePrefix: beneficiariesPrefix,
    isSubmitted,
    getValues,
    trigger,
    totalAmount: installmentAmount,
    onToggleMultibeneficiary,
    isInsideInstallment: true,
    installmentIndex: index
  });

  // Funzione per validare i campi di pagamento (IBAN e conto postale)
  const validatePaymentFields = useCallback(() => {
    const currentBeneficiaries = getValues(beneficiariesPrefix);

    if (
      Array.isArray(currentBeneficiaries) &&
      currentBeneficiaries.length > 0
    ) {
      currentBeneficiaries.forEach((_: unknown, beneficiaryIndex: number) => {
        // Trigger validazione IBAN
        trigger(`${beneficiariesPrefix}.${beneficiaryIndex}.iban` as Path<T>);

        // Trigger validazione conto postale
        trigger(
          `${beneficiariesPrefix}.${beneficiaryIndex}.postalAccount` as Path<T>
        );
      });
    }
  }, [trigger, beneficiariesPrefix, getValues]);

  // Funzione per validare l'importo totale dei beneficiari rispetto all'importo della rata
  const validateBeneficiaryAmounts = useCallback(() => {
    // Assicuriamo che l'importo della rata sia validato
    trigger(`${installmentsFieldNamePrefix}.${index}.amount` as Path<T>);

    // Validare tutti gli importi dei beneficiari
    beneficiaryManagement.updateAmountValidations();
  }, [trigger, installmentsFieldNamePrefix, index, beneficiaryManagement]);

  // Handler per quando cambia l'importo della rata
  const handleInstallmentAmountChange = useCallback(
    (value: string) => {
      setValue(
        `${installmentsFieldNamePrefix}.${index}.amount` as Path<T>,
        value as any
      );

      // Validare tutti gli importi dei beneficiari quando cambia l'importo della rata
      setTimeout(() => {
        validateBeneficiaryAmounts();
      }, 0);
    },
    [setValue, installmentsFieldNamePrefix, index, validateBeneficiaryAmounts]
  );

  // Wrapper per sincronizzare lo stato dello switch con il campo del form
  const toggleMultibeneficiary = useCallback(
    (value: boolean) => {
      // Impostiamo il valore nel form
      setValue(
        `${installmentsFieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>,
        value as any
      );

      // Se stiamo disattivando lo switch, resettiamo tutti i beneficiari
      if (!value) {
        // Pulisci tutti i beneficiari quando si disattiva il multibeneficiario
        if (beneficiaryManagement.resetAllBeneficiaries) {
          beneficiaryManagement.resetAllBeneficiaries();
        }
      } else if (value) {
        // Se stiamo attivando lo switch, assicuriamoci che ci sia almeno un beneficiario
        const newBeneficiary = {
          entityName: '',
          amount: '',
          taxCode: '',
          iban: '',
          postalAccount: '',
          taxonomyCode: '',
          isNew: true
        };

        // Utilizziamo setValue direttamente con un array contenente un beneficiario
        setValue(beneficiariesPrefix, [newBeneficiary] as any);

        // Validazione dei campi di pagamento dopo un breve ritardo
        setTimeout(() => {
          // Prima validiamo i campi importo
          validateBeneficiaryAmounts();

          // Poi validiamo i campi di pagamento
          validatePaymentFields();
        }, 100);
      }

      if (onToggleMultibeneficiary) {
        onToggleMultibeneficiary(value);
      }
    },
    [
      setValue,
      installmentsFieldNamePrefix,
      index,
      onToggleMultibeneficiary,
      beneficiariesPrefix,
      validatePaymentFields,
      validateBeneficiaryAmounts,
      beneficiaryManagement
    ]
  );

  // Effetto per inizializzare un beneficiario quando isMultibeneficiary diventa true
  useEffect(() => {
    if (isMultibeneficiary) {
      const currentBeneficiaries = getValues(beneficiariesPrefix);
      if (
        !currentBeneficiaries ||
        !Array.isArray(currentBeneficiaries) ||
        currentBeneficiaries.length === 0
      ) {
        const newBeneficiary = {
          entityName: '',
          amount: '',
          taxCode: '',
          iban: '',
          postalAccount: '',
          taxonomyCode: '',
          isNew: true
        };

        // Impostiamo direttamente un array con un beneficiario
        setValue(beneficiariesPrefix, [newBeneficiary] as any);

        // Validazione dei campi dopo un breve ritardo
        // per assicurarci che i campi siano stati correttamente inizializzati
        setTimeout(() => {
          // Prima validiamo i campi importo
          validateBeneficiaryAmounts();

          // Poi validiamo i campi di pagamento
          validatePaymentFields();
        }, 100);
      }
    }
  }, [
    isMultibeneficiary,
    getValues,
    setValue,
    beneficiariesPrefix,
    validatePaymentFields,
    validateBeneficiaryAmounts
  ]);

  return {
    ...beneficiaryManagement,
    isMultibeneficiary,
    toggleMultibeneficiary,
    validateBeneficiaryAmounts,
    handleInstallmentAmountChange,
    validatePaymentFields
  };
}
