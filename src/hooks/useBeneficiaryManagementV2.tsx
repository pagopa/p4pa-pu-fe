/**
 * Hook di gestione dei beneficiari con approccio semplificato
 * Facilita l'aggiunta, rimozione e validazione dei beneficiari per pagamenti con beneficiari multipli
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
 * Versione semplificata dell'hook di gestione beneficiari
 * Utilizza un approccio più dichiarativo e minimizza gli stati
 */
export function useBeneficiaryManagementV2<T extends FieldValues>(
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

  // ==== CONSTANTS ====
  const MAX_BENEFICIARIES = 4;
  const { t } = useTranslation();

  // ==== STATE & REFS ====
  // Stato minimale: solo ciò che è strettamente necessario
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<
    Record<string, boolean>
  >({});
  const [initialized, setInitialized] = useState(false);

  // Refs per compatibilità con l'API originale, ma semplificati
  const wasSubmittedRef = useRef(false);
  const isInitializingRef = useRef(false);

  // ==== FIELD ARRAY ====
  // Utilizziamo direttamente l'API di react-hook-form senza sovrapposizioni
  const fieldArray = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  const { fields, append, remove } = fieldArray;

  // ==== VALIDATORS ====
  const validators = createBeneficiaryValidators(
    t,
    getValues,
    fieldNamePrefix,
    totalAmount
  );

  const fieldValidators = createBeneficiaryFieldValidators(t);

  // ==== UTILITY FUNCTIONS ====

  /**
   * Ottiene il percorso completo di un campo
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
   * Ottiene un riepilogo dei beneficiari con informazioni aggiuntive
   */
  const getBeneficiariesSummary = useCallback(() => {
    return fields.map((field, index) => {
      // Otteniamo tutti i dati correnti dal form
      const dati = getValues(getBeneficiaryPath<T>(index)) || {};

      // Un beneficiario è nuovo se è stato aggiunto dopo il submit iniziale OPPURE ha il flag isNew=true
      const isNew =
        (wasSubmittedRef.current && !existingBeneficiaries[field.id]) ||
        (dati as Record<string, unknown>)?.isNew === true;

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
  }, [
    fields,
    getValues,
    getBeneficiaryPath,
    existingBeneficiaries,
    wasSubmittedRef
  ]);

  /**
   * Aggiorna la validazione di tutti i campi importo
   */
  const updateAmountValidations = useCallback(() => {
    // Validazione semplificata e diretta
    fields.forEach((_, index) => {
      trigger(getBeneficiaryPath<T>(index, 'amount'));
    });

    // Se siamo in una rata, trigger anche la validazione della rata stessa
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

  // ==== BENEFICIARY MANAGEMENT ====

  /**
   * Aggiunge un nuovo beneficiario
   */
  const addBeneficiary = useCallback(() => {
    if (fields.length < MAX_BENEFICIARIES) {
      const newBeneficiary: Beneficiary = {
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        isNew: true
      };

      append(newBeneficiary as unknown as PathValue<T, typeof fieldNamePrefix>);

      // Notifica cambiamenti in modo controllato
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
   * Rimuove tutti i beneficiari
   */
  const resetAllBeneficiaries = useCallback(() => {
    // Rimuoviamo tutti i beneficiari dalla field array
    const fieldsLength = fields.length;
    for (let i = fieldsLength - 1; i >= 0; i--) {
      remove(i);
    }

    // Reset delle validazioni
    setExistingBeneficiaries({});

    // Notifichiamo i cambiamenti
    if (onBeneficiariesChange) {
      onBeneficiariesChange([]);
    }
  }, [fields, remove, onBeneficiariesChange]);

  /**
   * Rimuove un beneficiario specifico
   * Versione semplificata che gestisce in modo più pulito la rimozione
   */
  const removeBeneficiary = useCallback(
    (index: number) => {
      // Se rimane un solo beneficiario, disattiva multibeneficiario
      const remainingBeneficiaries = fields.length - 1;
      const shouldDisableMultibeneficiary =
        remainingBeneficiaries === 0 && onToggleMultibeneficiary;

      // Se era l'ultimo beneficiario, gestiamo questo caso specifico
      if (shouldDisableMultibeneficiary) {
        resetAllBeneficiaries();
        onToggleMultibeneficiary(false);
        return;
      }

      // Se abbiamo setValue disponibile, usiamo l'approccio più affidabile
      if (setValue) {
        // Otteniamo i valori attuali
        const currentValues = getValues(`${fieldNamePrefix}` as Path<T>);

        if (Array.isArray(currentValues)) {
          // Creiamo un nuovo array senza l'elemento da rimuovere
          const updatedValues = [...currentValues];
          updatedValues.splice(index, 1);

          // Aggiorniamo il form direttamente
          setValue(
            fieldNamePrefix as unknown as Path<T>,
            updatedValues as unknown as PathValue<T, Path<T>>,
            { shouldDirty: true, shouldTouch: true, shouldValidate: true }
          );

          // Aggiorniamo la validazione dopo un breve ritardo
          setTimeout(() => {
            updateAmountValidations();

            // Notifichiamo i cambiamenti
            if (onBeneficiariesChange) {
              onBeneficiariesChange(getBeneficiariesSummary());
            }
          }, 50);

          return;
        }
      }

      // Fallback al metodo standard se setValue non è disponibile
      remove(index);

      // Aggiorniamo la validazione dopo un breve ritardo
      setTimeout(() => {
        updateAmountValidations();

        // Notifichiamo i cambiamenti
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

  // ==== EFFECTS ====

  // Registra i beneficiari esistenti al primo submit
  useEffect(() => {
    if (isSubmitted && !wasSubmittedRef.current) {
      // Memorizziamo lo stato attuale dei beneficiari
      const currentBeneficiaries = fields.reduce<Record<string, boolean>>(
        (acc, field) => {
          acc[field.id] = true;
          return acc;
        },
        {}
      );

      // Aggiorniamo lo stato
      setExistingBeneficiaries(currentBeneficiaries);
      wasSubmittedRef.current = true;
    }
  }, [isSubmitted, fields]);

  // Aggiorna validazione quando cambiano importi o beneficiari
  useEffect(() => {
    if (wasSubmittedRef.current) {
      fields.forEach((field, index) => {
        // Ottieni il beneficiario dal form per verificare se ha isNew=true
        const beneficiaryData = getValues(getBeneficiaryPath<T>(index));
        const isNewBeneficiary = beneficiaryData?.isNew === true;

        // Applica la validazione solo ai beneficiari esistenti e non a quelli nuovi
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

  // Inizializza il primo beneficiario se non ce ne sono
  useEffect(() => {
    if (fields.length === 0 && !initialized && !isInitializingRef.current) {
      try {
        // Verifichiamo se il genitore ha già inizializzato i beneficiari
        const currentValue = getValues(fieldNamePrefix as unknown as Path<T>);
        if (Array.isArray(currentValue) && currentValue.length > 0) {
          setInitialized(true);
          return;
        }
      } catch (error) {
        // Ignoriamo errori di tipizzazione
      }

      setInitialized(true);
      isInitializingRef.current = true;
      addBeneficiary();
      isInitializingRef.current = false;
    }
  }, [fields.length, initialized, addBeneficiary, getValues, fieldNamePrefix]);

  // Notifica cambiamenti ai beneficiari
  useEffect(() => {
    if (
      onBeneficiariesChange &&
      fields.length > 0 &&
      !isInitializingRef.current
    ) {
      onBeneficiariesChange(getBeneficiariesSummary());
    }
  }, [fields, onBeneficiariesChange, getBeneficiariesSummary]);

  // Restituiamo l'API compatibile con la versione originale
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
