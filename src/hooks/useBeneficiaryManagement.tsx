import { useEffect, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useFieldArray,
  UseFormGetValues,
  UseFormTrigger,
  Path,
  FieldValues,
  FieldArrayPath,
  PathValue,
  Control
} from 'react-hook-form';
import {
  createBeneficiaryValidators,
  createBeneficiaryFieldValidators
} from '../utils/fieldValidation';

export type BeneficiaryData = {
  entityName: string;
  amount: string;
  taxCode: string;
  iban: string;
  postalAccount: string;
  taxonomyCode: string;
  id?: string;
  isNew?: boolean;
};

export type BeneficiaryFormValues = {
  beneficiaries: Array<BeneficiaryData>;
};

type BeneficiaryFieldPath<T extends FieldValues> = FieldArrayPath<T>;

type UseBeneficiaryManagementProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly fieldNamePrefix: BeneficiaryFieldPath<T>;
  readonly isSubmitted: boolean;
  readonly getValues: UseFormGetValues<T>;
  readonly trigger: UseFormTrigger<T>;
  readonly totalAmount: string;
  readonly onToggleMultibeneficiary?: (value: boolean) => void;
  readonly onBeneficiariesChange?: (
    summary: Array<{
      id: string;
      index: number;
      isNew: boolean;
      dati: Record<string, unknown>;
    }>
  ) => void;
};

/**
 * Hook personalizzato per la gestione dei beneficiari
 * Gestisce l'aggiunta, rimozione e validazione dei beneficiari
 * Mantiene anche lo stato di tracking per determinare quali beneficiari sono stati aggiunti dopo il submit
 */
export function useBeneficiaryManagement<T extends FieldValues>({
  control,
  fieldNamePrefix,
  isSubmitted,
  getValues,
  trigger,
  totalAmount,
  onToggleMultibeneficiary,
  onBeneficiariesChange
}: UseBeneficiaryManagementProps<T>) {
  // ===== CONSTANTS =====
  const MAX_BENEFICIARIES = 4;
  const { t } = useTranslation();

  // ===== STATE & REFS =====
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<
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
  // Memorizziamo i validators per evitare ricreazioni ad ogni render
  const validators = useMemo(
    () =>
      createBeneficiaryValidators(t, getValues, fieldNamePrefix, totalAmount),
    [t, getValues, fieldNamePrefix, totalAmount]
  );

  const fieldValidators = useMemo(
    () => createBeneficiaryFieldValidators(t),
    [t]
  );

  // ===== UTILITY FUNCTIONS =====
  //Ottiene un riepilogo dei beneficiari attuali con informazioni aggiuntive
  //Usato per notificare il componente padre dei cambiamenti
  const getBeneficiariesSummary = () => {
    return fields.map((field, index) => {
      // Un beneficiario è nuovo se è stato aggiunto dopo il submit iniziale
      const isNew =
        !!wasSubmittedRef.current && !existingBeneficiaries[field.id];

      // Otteniamo tutti i dati correnti dal form
      const dati = getValues(`${fieldNamePrefix}.${index}` as Path<T>) || {};

      // Ci assicuriamo che l'ID sia corretto
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
  };

  //Aggiorna la validazione di tutti i campi importo quando viene rimosso un beneficiario
  //Necessario per ricalcolare la validazione dell'importo totale
  const updateAmountValidations = () => {
    fields.forEach((_, index) => {
      trigger(`${fieldNamePrefix}.${index}.amount` as Path<T>);
    });
  };

  // ===== BENEFICIARY MANAGEMENT =====

  //Aggiunge un nuovo beneficiario se il limite massimo non è stato raggiunto
  const addBeneficiary = () => {
    if (fields.length < MAX_BENEFICIARIES) {
      const newBeneficiary: BeneficiaryData = {
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        isNew: true
      };
      append(
        newBeneficiary as unknown as PathValue<T, BeneficiaryFieldPath<T>>
      );
    }
  };

  // Rimuove un beneficiario all'indice specificato
  const removeBeneficiary = (index: number) => {
    // Se rimane un solo beneficiario, disattiva multibeneficiario
    const remainingBeneficiaries = fields.length - 1;
    if (remainingBeneficiaries === 0 && onToggleMultibeneficiary) {
      onToggleMultibeneficiary(false);
      return;
    }

    // rimuoviamo il beneficiario e basta
    remove(index);

    // Notifichiamo i cambiamenti immediatamente se necessario
    if (onBeneficiariesChange) {
      onBeneficiariesChange(getBeneficiariesSummary());
    }

    // Aggiorniamo le validazioni dell'importo
    updateAmountValidations();
  };

  // ===== EFFECT HOOKS =====
  // Registra i beneficiari esistenti al primo submit
  useEffect(() => {
    if (isSubmitted && !wasSubmittedRef.current) {
      // Prima volta che viene fatto submit - memorizziamo lo stato attuale dei beneficiari
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

  // Aggiorna validazione quando cambiano gli importi
  useEffect(() => {
    if (wasSubmittedRef.current) {
      fields.forEach((field, index) => {
        if (existingBeneficiaries[field.id]) {
          trigger(`${fieldNamePrefix}.${index}` as Path<T>);
        }
      });
    }
  }, [trigger, fieldNamePrefix, fields, totalAmount, existingBeneficiaries]);

  // Inizializza il primo beneficiario se non ce ne sono
  useEffect(() => {
    if (fields.length === 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      isInitializingRef.current = true;
      addBeneficiary();
      isInitializingRef.current = false;
    }
  }, [fields.length]);

  // Notifica cambiamenti ai beneficiari
  useEffect(() => {
    if (onBeneficiariesChange && fields.length > 0) {
      onBeneficiariesChange(getBeneficiariesSummary());
    }
  }, [fields, onBeneficiariesChange]);

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
    updateAmountValidations
  };
}
