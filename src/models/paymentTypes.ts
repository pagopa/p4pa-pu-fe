/**
 * File contenente tutti i tipi relativi al sistema di pagamento
 * Centralizza le definizioni di tipi per migliorare la manutenibilità e consistenza
 */
import {
  Control,
  FieldArrayPath,
  FieldErrors,
  FieldValues,
  Path,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger
} from 'react-hook-form';

/**
 * Tipo che rappresenta un beneficiario del pagamento
 */
export type Beneficiary = {
  /** Nome dell'ente beneficiario */
  entityName: string;
  /** Importo assegnato al beneficiario */
  amount: string;
  /** Codice fiscale del beneficiario */
  taxCode: string;
  /** IBAN del beneficiario */
  iban: string;
  /** Conto postale del beneficiario */
  postalAccount: string;
  /** Codice tassonomico */
  taxonomyCode: string;
  /** Id univoco del beneficiario */
  id?: string;
  /** Flag che indica se il beneficiario è stato aggiunto dopo il submit */
  isNew?: boolean;
};

/**
 * Tipo che rappresenta una singola rata di pagamento
 */
export type Installment = {
  /** Importo della rata */
  amount: string;
  /** Data di scadenza della rata */
  dueDate: string | null;
  /** Flag che indica se la rata ha beneficiari multipli */
  isMultibeneficiary?: boolean;
  /** Lista dei beneficiari della rata */
  beneficiaries?: Array<Beneficiary>;
  /** Id univoco della rata */
  id?: string;
  /** Flag che indica se la rata è stata aggiunta dopo il submit */
  isNew?: boolean;
};

/**
 * Enumeration che rappresenta le opzioni di pagamento disponibili
 */
export type PaymentOption = 'SINGLE' | 'INSTALLMENTS';

/**
 * Tipo che rappresenta una proprietà con valore e flag di sola lettura
 */
export type ReadonlyProperty<T> = {
  value: T;
  readonly: boolean;
};

/**
 * Configurazione completa del pagamento
 */
export type PaymentConfiguration = {
  /** Oggetto del pagamento */
  paymentObject: ReadonlyProperty<string>;
  /** Modalità di pagamento (unica o rateale) */
  paymentOption: ReadonlyProperty<PaymentOption>;
  /** Importo totale del pagamento */
  amount: ReadonlyProperty<string>;
  /** Data di scadenza (solo per pagamento unico) */
  dueDate: ReadonlyProperty<string | null>;
  /** Flag che indica se la data di scadenza è obbligatoria */
  flagMandatoryDueDate: boolean;
  /** Flag che indica se il pagamento ha beneficiari multipli */
  isMultibeneficiary: ReadonlyProperty<boolean>;
  /** Lista dei beneficiari (solo per pagamento unico con multi-beneficiario) */
  beneficiaries?: Array<Beneficiary>;
  /** Lista delle rate (solo per pagamento rateale) */
  installments?: Array<Installment>;
};

/**
 * Utility types per semplificare la manipolazione degli oggetti di pagamento
 */

/**
 * Estrae il valore effettivo da una proprietà di sola lettura
 */
export type ExtractValue<T> = T extends ReadonlyProperty<infer U> ? U : never;

/**
 * Converte tutte le ReadonlyProperty in valori semplici
 */
export type UnwrapReadonlyProperties<T> = {
  [K in keyof T]: T[K] extends ReadonlyProperty<infer U> ? U : T[K];
};

/**
 * Converte tutti i valori semplici in ReadonlyProperty
 */
export type WrapAsReadonlyProperties<T> = {
  [K in keyof T]: T[K] extends ReadonlyProperty<any>
    ? T[K]
    : ReadonlyProperty<T[K]>;
};

/**
 * Tipo per validatori di campo
 */
export type FieldValidator = Record<string, unknown>;

/**
 * Tipo per validatori delle rate
 */
export type InstallmentValidators = {
  amount: FieldValidator;
  dueDate: {
    required: string | boolean;
  };
};

/**
 * Tipo per i valori del form
 */
export type PaymentFormValues = {
  paymentObject: ReadonlyProperty<string>;
  paymentOption: ReadonlyProperty<PaymentOption>;
  amount: ReadonlyProperty<string>;
  dueDate: ReadonlyProperty<Date | null>;
  isMultibeneficiary: ReadonlyProperty<boolean>;
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
};

/**
 * TIPI PER VALIDAZIONE
 */

/**
 * Tipo per le regole di validazione dell'importo
 */
export type AmountValidationRules = {
  /** Se il campo è richiesto */
  required: string;
  /** Messaggio di errore se il valore non è valido */
  invalidValue: string;
  /** Messaggio di errore se il valore è negativo */
  negative: string;
  /** Messaggio di errore se il valore è zero */
  zero: string;
  /** Messaggio di errore se il totale beneficiari non corrisponde */
  totalMismatch: string;
};

/**
 * Tipo per le regole di validazione della data
 */
export type DateValidationRules = {
  /** Se il campo è richiesto */
  required: string | boolean;
  /** Messaggio di errore se la data è nel passato */
  pastDate: string;
};

/**
 * Tipo per le regole di validazione del beneficiario
 */
export type BeneficiaryValidationRules = {
  /** Regole per l'importo */
  amount: AmountValidationRules;
  /** Regole per il nome entità */
  entityName: {
    required: string;
  };
  /** Regole per il codice fiscale */
  taxCode: {
    required: string;
    invalid: string;
  };
  /** Regole per i campi di pagamento */
  paymentFields: {
    required: string;
  };
  /** Regole per il codice tassonomico */
  taxonomyCode: {
    required: string;
  };
};

/**
 * Tipo per i risultati di validazione
 */
export type ValidationResult = {
  /** Se la validazione è passata */
  isValid: boolean;
  /** Messaggio di errore, se presente */
  errorMessage?: string;
};

/**
 * Tipo che estende la funzione validator da react-hook-form
 * per aggiungere il tipo di ritorno
 */
export type TypedValidator = FieldValidator & {
  isValid?: (value: string) => ValidationResult;
};

/**
 * Tipo per il contesto di validazione
 */
export type ValidationContext = {
  /** Importo totale del pagamento o della rata */
  totalAmount?: string;
  /** Flag che indica se la data è obbligatoria */
  isDateRequired?: boolean;
  /** Messaggio personalizzato per date obbligatorie */
  requiredDateMessage?: string;
};

/**
 * Tipo per validatori di campo del beneficiario
 */
export type BeneficiaryFieldValidators = {
  /** Validatore per il codice fiscale del beneficiario */
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  /** Validatore per l'IBAN */
  validateIBAN: (value: string) => string | undefined;
  /** Validatore per il conto postale */
  validatePostalAccount: (value: string) => string | undefined;
  /** Validatore per il metodo di pagamento (richiede almeno uno tra IBAN e conto postale) */
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

/**
 * Contesto di validazione per beneficiari
 */
export type BeneficiaryValidationContext<T extends FieldValues> = {
  /** ID del beneficiario */
  id: string;
  /** Indice del beneficiario nella lista */
  index: number;
  /** Se il form è stato inviato */
  isSubmitted: boolean;
  /** Riferimento che indica se il form è stato inviato */
  wasSubmittedRef: React.RefObject<boolean>;
  /** Registro dei beneficiari esistenti (pre-submit) */
  existingBeneficiaries: Record<string, boolean>;
  /** Errori del form */
  errors: FieldErrors<T>;
  /** Prefisso per i campi del beneficiario */
  fieldNamePrefix: string;
  /** Funzione per ottenere i valori dal form */
  getValues: UseFormGetValues<T>;
  /** Funzione per la traduzione */
  t: (key: string) => string;
};

/**
 * TIPI PER GLI HOOK DI GESTIONE PAGAMENTI
 */

/**
 * Tipo base per gli hook di gestione
 */
export type BaseHookProps<T extends FieldValues> = {
  /** Control del form */
  readonly control: Control<T>;
  /** Flag che indica se il form è stato inviato */
  readonly isSubmitted: boolean;
  /** Funzione per ottenere i valori del form */
  readonly getValues: UseFormGetValues<T>;
  /** Funzione per attivare la validazione */
  readonly trigger: UseFormTrigger<T>;
};

/**
 * Proprietà per hook di gestione beneficiari
 */
export type BeneficiaryManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    /** Prefisso per accedere ai campi dei beneficiari nel form */
    readonly fieldNamePrefix: FieldArrayPath<T>;
    /** Importo totale del pagamento o della rata */
    readonly totalAmount: string;
    /** Funzione per impostare i valori nel form */
    readonly setValue?: UseFormSetValue<T>;
    /** Callback invocata quando cambia lo stato del multibeneficiario */
    readonly onToggleMultibeneficiary?: (value: boolean) => void;
    /** Callback invocata quando cambiano i beneficiari */
    readonly onBeneficiariesChange?: (
      summary: Array<{
        id: string;
        index: number;
        isNew: boolean;
        dati: Record<string, unknown>;
      }>
    ) => void;
    /** Flag che indica se i beneficiari sono dentro una rata */
    readonly isInsideInstallment?: boolean;
    /** Indice della rata (se dentro una rata) */
    readonly installmentIndex?: number;
  };

/**
 * Proprietà per hook di gestione rate
 */
export type InstallmentManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    /** Prefisso per accedere ai campi delle rate nel form */
    readonly fieldNamePrefix: FieldArrayPath<T>;
    /** Funzione per impostare i valori nel form */
    readonly setValue: UseFormSetValue<T>;
    /** Flag che indica se la data di scadenza è obbligatoria */
    readonly flagMandatoryDueDate?: boolean;
    /** Callback invocata quando cambiano le rate */
    readonly onInstallmentsChange?: (
      installments: Array<Installment>,
      totalAmount: string
    ) => void;
  };

/**
 * Proprietà per hook di gestione beneficiari nelle rate
 */
export type InstallmentBeneficiaryManagementProps<T extends FieldValues> =
  BaseHookProps<T> & {
    /** Indice della rata */
    readonly index: number;
    /** Prefisso per accedere ai campi delle rate nel form */
    readonly installmentsFieldNamePrefix: string;
    /** Funzione per impostare i valori nel form */
    readonly setValue: UseFormSetValue<T>;
    /** Callback invocata quando cambia lo stato del multibeneficiario */
    readonly onToggleMultibeneficiary?: (value: boolean) => void;
  };

/**
 * Risultato dell'hook di gestione beneficiari
 */
export type BeneficiaryManagementResult = {
  /** Campi dei beneficiari */
  fields: Array<Record<string, unknown>>;
  /** Validatori */
  validators: Record<string, unknown>;
  /** Validatori di campo */
  fieldValidators: Record<string, unknown>;
  /** Numero massimo di beneficiari */
  MAX_BENEFICIARIES: number;
  /** Registro dei beneficiari esistenti */
  existingBeneficiaries: Record<string, boolean>;
  /** Ref che indica se il form è stato inviato */
  wasSubmittedRef: { current: boolean };
  /** Ref che indica se l'inizializzazione è in corso */
  isInitializingRef: { current: boolean };
  /** Funzione per aggiungere un beneficiario */
  addBeneficiary: () => void;
  /** Funzione per rimuovere un beneficiario */
  removeBeneficiary: (index: number) => void;
  /** Funzione per reset di tutti i beneficiari */
  resetAllBeneficiaries: () => void;
  /** Funzione per aggiornare le validazioni degli importi */
  updateAmountValidations: () => void;
  /** Funzione per ottenere il path di un campo beneficiario */
  getBeneficiaryPath: <U extends FieldValues>(
    index: number,
    field?: string
  ) => Path<U>;
};

/**
 * Risultato dell'hook di gestione rate
 */
export type InstallmentManagementResult = {
  /** Campi delle rate */
  fields: Array<Record<string, unknown>>;
  /** Validatori */
  validators: InstallmentValidators;
  /** Registro delle rate esistenti */
  existingInstallments: Record<string, boolean>;
  /** Numero minimo di rate */
  MIN_INSTALLMENTS: number;
  /** Numero massimo di rate */
  MAX_INSTALLMENTS: number;
  /** Ref che indica se il form è stato inviato */
  wasSubmittedRef: { current: boolean };
  /** Ref che indica se l'inizializzazione è in corso */
  isInitializingRef: { current: boolean };
  /** Funzione per aggiungere una rata */
  addInstallment: () => void;
  /** Funzione per rimuovere una rata */
  removeInstallment: (index: number) => void;
  /** Funzione per calcolare l'importo totale */
  calculateTotalAmount: () => string;
  /** Funzione per ottenere i dati delle rate */
  getInstallmentsData: () => Array<Installment>;
};

/**
 * Risultato dell'hook di gestione beneficiari nelle rate
 */
export type InstallmentBeneficiaryManagementResult =
  BeneficiaryManagementResult & {
    /** Flag che indica se la rata ha beneficiari multipli */
    isMultibeneficiary: boolean;
    /** Funzione per attivare/disattivare i beneficiari multipli */
    toggleMultibeneficiary: (value: boolean) => void;
    /** Funzione per validare gli importi dei beneficiari */
    validateBeneficiaryAmounts: () => void;
    /** Funzione per gestire il cambio dell'importo della rata */
    handleInstallmentAmountChange: (value: string) => void;
    /** Funzione per validare i campi di pagamento */
    validatePaymentFields: () => void;
  };
