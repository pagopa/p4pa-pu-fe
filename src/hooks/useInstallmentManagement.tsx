import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useFieldArray,
  UseFormGetValues,
  UseFormTrigger,
  Path,
  FieldValues,
  FieldArrayPath,
  PathValue,
  Control,
  UseFormSetValue
} from 'react-hook-form';
import { createAmountValidator } from '../utils/fieldValidation';
import { formatDate, moneyFormat } from '../utils/formatters';

// Definizione del tipo per i validatori delle rate
export type InstallmentValidators = {
  amount: Record<string, unknown>;
  dueDate: {
    required: string | boolean;
  };
};

export type InstallmentData = {
  amount: string;
  dueDate: string | null;
  isMultibeneficiary?: boolean;
  beneficiaries?: Array<{
    entityName: string;
    amount: string;
    taxCode: string;
    iban: string;
    postalAccount: string;
    taxonomyCode: string;
  }>;
  id?: string;
  isNew?: boolean;
};

export type InstallmentFormValues = {
  installments: Array<InstallmentData>;
};

type InstallmentFieldPath<T extends FieldValues> = FieldArrayPath<T>;

type UseInstallmentManagementProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly fieldNamePrefix: InstallmentFieldPath<T>;
  readonly isSubmitted: boolean;
  readonly getValues: UseFormGetValues<T>;
  readonly setValue: UseFormSetValue<T>;
  readonly trigger: UseFormTrigger<T>;
  readonly flagMandatoryDueDate?: boolean;
  readonly onInstallmentsChange?: (
    installments: Array<InstallmentData>,
    totalAmount: string
  ) => void;
};

/**
 * Hook personalizzato per la gestione delle rate
 * Gestisce l'aggiunta, rimozione e validazione delle rate
 */
export function useInstallmentManagement<T extends FieldValues>({
  control,
  fieldNamePrefix,
  isSubmitted,
  getValues,
  trigger,
  flagMandatoryDueDate = true,
  onInstallmentsChange
}: UseInstallmentManagementProps<T>) {
  // ===== CONSTANTS =====
  const MIN_INSTALLMENTS = 2;
  const MAX_INSTALLMENTS = 12;
  const { t } = useTranslation();

  // ===== STATE & REFS =====
  const [existingInstallments, setExistingInstallments] = useState<
    Record<string, boolean>
  >({});
  const wasSubmittedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // ===== FIELD ARRAY =====
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  // ===== VALIDATORS =====
  // Creazione diretta dei validatori senza useMemo
  // L'obbligatorietà della data di scadenza dipende dal flag flagMandatoryDueDate
  const validators: InstallmentValidators = {
    amount: createAmountValidator(t),
    dueDate: {
      required: flagMandatoryDueDate
        ? t('debtPositionCreateWizard.step3.installments.dueDate.required')
        : false
    }
  };

  // ===== UTILITY FUNCTIONS =====
  // Ottiene i dati attuali di tutte le rate
  function getInstallmentsData(): Array<InstallmentData> {
    return fields.map((field, index) => {
      const installmentData = getValues(
        `${fieldNamePrefix}.${index}` as Path<T>
      );
      // Se la data è un oggetto Date, formattala prima di restituirla
      const dueDate = installmentData?.dueDate;

      // Ottieni l'importo e formattalo se presente
      const amount = installmentData?.amount;
      const formattedAmount = amount
        ? moneyFormat(parseFloat(amount) * 100)
            .replace('€', '')
            .trim()
        : '';

      return {
        ...installmentData,
        // Formatta la data solo se è un oggetto Date e se è valida
        dueDate:
          dueDate instanceof Date && !isNaN(dueDate.getTime())
            ? formatDate(dueDate.toISOString())
            : dueDate,
        // Usa il valore formattato per l'importo
        amount: formattedAmount,
        id: field.id,
        isNew: !!wasSubmittedRef.current && !existingInstallments[field.id]
      } as InstallmentData;
    });
  }

  // Calcola l'importo totale sommando tutte le rate
  function calculateTotalAmount(): string {
    return fields
      .reduce((total, _, index) => {
        const installmentData = getValues(
          `${fieldNamePrefix}.${index}` as Path<T>
        );
        const amount = installmentData?.amount as string | undefined;
        const amountValue = amount ? parseFloat(amount.replace(',', '.')) : 0;
        return total + amountValue;
      }, 0)
      .toFixed(2);
  }

  // ===== INSTALLMENT MANAGEMENT =====
  // Aggiunge una nuova rata se il limite massimo non è stato raggiunto
  function addInstallment() {
    if (fields.length < MAX_INSTALLMENTS) {
      // Crea una nuova rata semplice con data di scadenza vuota
      const newInstallment: InstallmentData = {
        amount: '',
        dueDate: null, // Data di scadenza sempre vuota per default
        isMultibeneficiary: false
      };

      append(
        newInstallment as unknown as PathValue<T, InstallmentFieldPath<T>>
      );

      // Aggiorna gli importi e notifica i cambiamenti
      setTimeout(() => {
        console.log('addInstallment setTimeout');
        const newTotalAmount = calculateTotalAmount();
        if (onInstallmentsChange) {
          const currentInstallments = getInstallmentsData();
          onInstallmentsChange(currentInstallments, newTotalAmount);
        }
      }, 0);
    }
  }

  // Rimuove una rata all'indice specificato
  function removeInstallment(index: number) {
    // Non permettere la rimozione se rimangono solo le due rate minime richieste
    if (fields.length <= MIN_INSTALLMENTS) {
      return;
    }

    remove(index);

    // Aggiorna gli importi e notifica i cambiamenti
    setTimeout(() => {
      console.log('removeInstallment setTimeout');
      const newTotalAmount = calculateTotalAmount();
      if (onInstallmentsChange) {
        const currentInstallments = getInstallmentsData();
        onInstallmentsChange(currentInstallments, newTotalAmount);
      }
    }, 0);
  }

  // ===== EFFECT HOOKS =====
  // Registra le rate esistenti al primo submit
  useEffect(() => {
    if (isSubmitted && !wasSubmittedRef.current) {
      // Prima volta che viene fatto submit - memorizziamo lo stato attuale delle rate
      const currentInstallments = fields.reduce<Record<string, boolean>>(
        (acc, field) => {
          acc[field.id] = true;
          return acc;
        },
        {}
      );
      setExistingInstallments(currentInstallments);
      wasSubmittedRef.current = true;
    }
  }, [isSubmitted, fields]);

  // Aggiorna validazione quando cambiano gli importi
  useEffect(() => {
    if (wasSubmittedRef.current) {
      fields.forEach((field, index) => {
        if (existingInstallments[field.id]) {
          trigger(`${fieldNamePrefix}.${index}` as Path<T>);
        }
      });
    }
  }, [trigger, fieldNamePrefix, fields, existingInstallments]);

  // Inizializza le prime due rate se non ce ne sono
  useEffect(() => {
    if (fields.length === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      isInitializingRef.current = true;

      // Crea due rate iniziali semplici con date di scadenza vuote
      const firstInstallment: InstallmentData = {
        amount: '',
        dueDate: null, // Data di scadenza vuota
        isMultibeneficiary: false
      };

      const secondInstallment: InstallmentData = {
        amount: '',
        dueDate: null, // Data di scadenza vuota
        isMultibeneficiary: false
      };

      // Aggiungi le due rate
      append(
        firstInstallment as unknown as PathValue<T, InstallmentFieldPath<T>>
      );
      append(
        secondInstallment as unknown as PathValue<T, InstallmentFieldPath<T>>
      );

      isInitializingRef.current = false;
    }
  }, [fields.length, append]);

  // Notifica le modifiche alle rate e calcola il totale
  useEffect(() => {
    if (
      onInstallmentsChange &&
      fields.length > 0 &&
      !isInitializingRef.current
    ) {
      const totalAmount = calculateTotalAmount();
      const currentInstallments = getInstallmentsData();
      onInstallmentsChange(currentInstallments, totalAmount);
    }
  }, [fields, onInstallmentsChange]);

  return {
    fields,
    validators,
    existingInstallments,
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
