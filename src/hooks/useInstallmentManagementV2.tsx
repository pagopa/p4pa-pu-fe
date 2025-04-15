/**
 * Hook per la gestione delle rate di pagamento
 * Versione migliorata che utilizza il pattern reducer
 */
import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldArray, Path, FieldValues, PathValue } from 'react-hook-form';
import { createAmountValidator } from '../utils/fieldValidation';
import { formatDate, moneyFormat } from '../utils/formatters';
import {
  Installment,
  InstallmentManagementProps,
  InstallmentManagementResult,
  InstallmentValidators
} from '../models/paymentTypes';

// ==== TYPES ====

/**
 * Stato interno dell'hook
 */
type InstallmentState = {
  /** Registro delle rate esistenti prima del submit */
  existingInstallments: Record<string, boolean>;
  /** Flag che indica se il form è stato sottomesso */
  wasSubmitted: boolean;
  /** Flag che indica se l'inizializzazione è in corso */
  isInitializing: boolean;
  /** Flag che indica se l'inizializzazione è stata completata */
  hasInitialized: boolean;
  /** Ultimo importo totale calcolato per evitare aggiornamenti inutili */
  lastTotalAmount: string;
  /** Flag per prevenire aggiornamenti ricorsivi */
  isUpdating: boolean;
};

/**
 * Azioni per il reducer
 */
type InstallmentAction =
  | { type: 'MARK_SUBMITTED' }
  | { type: 'SET_EXISTING_INSTALLMENTS'; installments: Record<string, boolean> }
  | { type: 'START_INITIALIZING' }
  | { type: 'FINISH_INITIALIZING' }
  | { type: 'MARK_INITIALIZED' }
  | { type: 'SET_LAST_TOTAL_AMOUNT'; amount: string }
  | { type: 'START_UPDATING' }
  | { type: 'FINISH_UPDATING' };

// ==== REDUCER ====

/**
 * Reducer per gestire lo stato delle rate in modo centralizzato
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
        existingInstallments: action.installments
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
 * Versione migliorata dell'hook di gestione rate
 * Utilizza useReducer per una gestione dello stato più prevedibile
 */
export function useInstallmentManagementV2<T extends FieldValues>(
  props: InstallmentManagementProps<T>
): InstallmentManagementResult {
  const {
    control,
    fieldNamePrefix,
    isSubmitted,
    getValues,
    trigger,
    flagMandatoryDueDate = true,
    onInstallmentsChange
  } = props;

  // ==== CONSTANTS ====
  const MIN_INSTALLMENTS = 2;
  const MAX_INSTALLMENTS = 12;
  const { t } = useTranslation();

  // ==== STATE & REFS ====
  const [state, dispatch] = useReducer(installmentReducer, {
    existingInstallments: {},
    wasSubmitted: false,
    isInitializing: false,
    hasInitialized: false,
    lastTotalAmount: '',
    isUpdating: false
  });

  // Refs per compatibilità con l'API originale
  const wasSubmittedRef = useRef(state.wasSubmitted);
  const isInitializingRef = useRef(state.isInitializing);

  // Aggiorniamo i refs quando cambia lo stato
  useEffect(() => {
    wasSubmittedRef.current = state.wasSubmitted;
    isInitializingRef.current = state.isInitializing;
  }, [state.wasSubmitted, state.isInitializing]);

  // ==== FIELD ARRAY ====
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldNamePrefix
  });

  // ==== VALIDATORS ====
  const validators: InstallmentValidators = {
    amount: createAmountValidator(t),
    dueDate: {
      required: flagMandatoryDueDate
        ? t('debtPositionCreateWizard.step3.installments.dueDate.required')
        : false
    }
  };

  // ==== UTILITY FUNCTIONS ====

  /**
   * Ottiene i dati attuali di tutte le rate
   */
  const getInstallmentsData = useCallback((): Array<Installment> => {
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
        isNew:
          !!wasSubmittedRef.current && !state.existingInstallments[field.id]
      } as Installment;
    });
  }, [fields, getValues, fieldNamePrefix, state.existingInstallments]);

  /**
   * Calcola l'importo totale sommando tutte le rate
   */
  const calculateTotalAmount = useCallback((): string => {
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
  }, [fields, getValues, fieldNamePrefix]);

  // ==== INSTALLMENT MANAGEMENT ====

  /**
   * Aggiunge una nuova rata
   */
  const addInstallment = useCallback(() => {
    if (fields.length < MAX_INSTALLMENTS) {
      // Crea una nuova rata semplice con data di scadenza vuota
      const newInstallment: Installment = {
        amount: '',
        dueDate: null, // Data di scadenza sempre vuota per default
        isMultibeneficiary: false
      };

      // Aggiunge la nuova rata al form
      append(newInstallment as unknown as PathValue<T, typeof fieldNamePrefix>);

      // Aggiorna gli importi e notifica i cambiamenti
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
   * Rimuove una rata all'indice specificato
   */
  const removeInstallment = useCallback(
    (index: number) => {
      // Non permettere la rimozione se rimangono solo le due rate minime richieste
      if (fields.length <= MIN_INSTALLMENTS) {
        return;
      }

      // Rimuove la rata dal form
      remove(index);

      // Aggiorna gli importi e notifica i cambiamenti
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

  // ==== EFFECTS ====

  // Registra le rate esistenti al primo submit
  useEffect(() => {
    if (isSubmitted && !state.wasSubmitted) {
      // Memorizziamo lo stato attuale delle rate
      const currentInstallments = fields.reduce<Record<string, boolean>>(
        (acc, field) => {
          acc[field.id] = true;
          return acc;
        },
        {}
      );

      // Aggiorniamo lo stato
      dispatch({
        type: 'SET_EXISTING_INSTALLMENTS',
        installments: currentInstallments
      });
      dispatch({ type: 'MARK_SUBMITTED' });
    }
  }, [isSubmitted, fields, state.wasSubmitted]);

  // Aggiorna validazione quando cambiano gli importi
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

  // Inizializza le prime due rate se non ce ne sono
  useEffect(() => {
    console.log('[INSTALLMENT-DEBUG] fields.length:', fields.length);
    console.log(
      '[INSTALLMENT-DEBUG] state.hasInitialized:',
      state.hasInitialized
    );
    console.log('[INSTALLMENT-DEBUG] fieldNamePrefix:', fieldNamePrefix);

    // Aggiungiamo un controllo esplicito sul valore di hasInitialized
    // per avere la certezza che non vengano aggiunte rate multiple
    if (fields.length === 0 && !state.hasInitialized) {
      console.log('[INSTALLMENT-DEBUG] Inizializzazione rate START');

      // Prima assicuriamoci che altre inizializzazioni non possano avvenire
      dispatch({ type: 'MARK_INITIALIZED' });

      // Poi iniziamo la fase di inizializzazione
      dispatch({ type: 'START_INITIALIZING' });

      try {
        // Verifichiamo se ci sono già dei dati nel form
        const formValue = getValues(fieldNamePrefix as unknown as Path<T>);
        console.log('[INSTALLMENT-DEBUG] Valore corrente nel form:', formValue);

        if (Array.isArray(formValue) && formValue.length > 0) {
          console.log(
            '[INSTALLMENT-DEBUG] Dati già presenti, saltando inizializzazione'
          );
          dispatch({ type: 'FINISH_INITIALIZING' });
          return;
        }

        // Crea due rate iniziali semplici con date di scadenza vuote
        const firstInstallment: Installment = {
          amount: '',
          dueDate: null, // Data di scadenza vuota
          isMultibeneficiary: false
        };

        const secondInstallment: Installment = {
          amount: '',
          dueDate: null, // Data di scadenza vuota
          isMultibeneficiary: false
        };

        console.log('[INSTALLMENT-DEBUG] Aggiungendo due rate iniziali');

        // Utilizziamo le append in maniera sequenziale e sincrona
        append(
          firstInstallment as unknown as PathValue<T, typeof fieldNamePrefix>
        );

        append(
          secondInstallment as unknown as PathValue<T, typeof fieldNamePrefix>
        );

        console.log(
          '[INSTALLMENT-DEBUG] Rate aggiunte, ora fields.length dovrebbe essere 2'
        );
      } catch (error) {
        console.error(
          "[INSTALLMENT-DEBUG] Errore durante l'inizializzazione:",
          error
        );
      } finally {
        // Finisce l'inizializzazione
        dispatch({ type: 'FINISH_INITIALIZING' });
        console.log('[INSTALLMENT-DEBUG] Inizializzazione rate END');
      }
    }
  }, [fields.length, append, fieldNamePrefix, state.hasInitialized, getValues]);

  // Log aggiuntivo per monitorare i cambiamenti nei fields
  useEffect(() => {
    console.log(
      '[INSTALLMENT-DEBUG] fields cambiati, lunghezza:',
      fields.length
    );
    console.log(
      '[INSTALLMENT-DEBUG] fields IDs:',
      fields.map((f) => f.id)
    );
  }, [fields]);

  // Notifica le modifiche alle rate e calcola il totale - solo per le rate esistenti
  useEffect(() => {
    // Verifichiamo se siamo già in fase di aggiornamento per evitare cicli
    // o se stiamo inizializzando (in questo caso non vogliamo notificare)
    if (state.isUpdating || state.isInitializing) {
      return;
    }

    // Notifica solo se ci sono rate e non siamo in fase di inizializzazione
    if (onInstallmentsChange && fields.length > 0) {
      // Calcola il nuovo totale
      const totalAmount = calculateTotalAmount();

      // Confronta con l'ultimo totale memorizzato per evitare aggiornamenti inutili
      if (totalAmount !== state.lastTotalAmount) {
        // Imposta il flag di aggiornamento per evitare chiamate ricorsive
        dispatch({ type: 'START_UPDATING' });
        // Aggiorna il valore di riferimento
        dispatch({ type: 'SET_LAST_TOTAL_AMOUNT', amount: totalAmount });
        // Esegui la callback
        const currentInstallments = getInstallmentsData();
        onInstallmentsChange(currentInstallments, totalAmount);
        // Reimposta il flag dopo il completamento
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

  // Restituiamo l'API compatibile con la versione originale
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
