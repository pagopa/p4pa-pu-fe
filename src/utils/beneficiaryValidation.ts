import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormGetValues
} from 'react-hook-form';

// ===== VALIDATION TYPES =====
export type BeneficiaryFieldValidators = {
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  validateIBAN: (value: string) => string | undefined;
  validatePostalAccount: (value: string) => string | undefined;
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

export type ValidationContext<T extends FieldValues> = {
  id: string;
  index: number;
  isSubmitted: boolean;
  wasSubmittedRef: React.RefObject<boolean>;
  existingBeneficiaries: Record<string, boolean>;
  errors: FieldErrors<T>;
  fieldNamePrefix: string;
  getValues: UseFormGetValues<T>;
  t: (key: string) => string;
};

// ===== UTILITY FUNCTIONS =====
// Verifica se un valore di stringa è vuoto
export function isEmpty(value?: string | unknown): boolean {
  if (typeof value !== 'string') {
    return true;
  }
  return !value || value.trim() === '';
}

// Ottiene i dati di errore dal form
export function getErrorData<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldNamePrefix: string,
  index: number,
  fieldName: string
) {
  // Gestione del caso speciale per beneficiari all'interno di rate
  // Il percorso potrebbe essere qualcosa come 'installments.0.beneficiaries'
  if (fieldNamePrefix.includes('installments')) {
    try {
      // Dividiamo il prefisso in parti per navigare nella struttura
      const parts = fieldNamePrefix.split('.');

      // Navighiamo l'oggetto errors fino agli errori della rata specifica
      const installmentIndex = parseInt(parts[1], 10);

      // Accediamo all'installment specifico - usiamo tipo any per evitare errori di TypeScript
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const installmentErrors = (errors as any)?.installments?.[
        installmentIndex
      ];

      if (
        installmentErrors &&
        installmentErrors.beneficiaries &&
        installmentErrors.beneficiaries[index]
      ) {
        // Accediamo direttamente agli errori del beneficiario
        const beneficiaryErrors = installmentErrors.beneficiaries[index];

        // Verifichiamo se c'è un errore per il campo specifico
        const hasError = !!beneficiaryErrors?.[fieldName];
        const errorMessage = beneficiaryErrors?.[fieldName]?.message || '';

        return { hasError, errorMessage };
      }
    } catch (error) {
      // Gestione silenziosa dell'errore
    }
  }

  // Caso standard - mantenuto per compatibilità
  try {
    const fieldErrors = (
      errors[fieldNamePrefix] as unknown as Record<
        number,
        FieldErrors<Record<string, unknown>>
      >
    )?.[index];

    const hasError = !!fieldErrors?.[fieldName];
    const errorMessage = (fieldErrors?.[fieldName]?.message as string) || '';

    return {
      hasError,
      errorMessage
    };
  } catch (error) {
    return {
      hasError: false,
      errorMessage: ''
    };
  }
}

// ===== VALIDATION FUNCTIONS =====
// Verifica se un beneficiario è nuovo (aggiunto dopo il submit)
export function isBeneficiaryNew(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return !!wasSubmittedRef.current && !existingBeneficiaries[id];
}

// Verifica se un beneficiario è appena creato (nuovo)
export function isRecentlyCreated(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  if (!wasSubmittedRef.current) {
    return true;
  }
  return !existingBeneficiaries[id];
}

// Determina se mostrare errori di validazione per un beneficiario
export function shouldShowValidationErrors(
  id: string,
  isSubmitted: boolean,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return (
    isSubmitted &&
    !(
      isRecentlyCreated(id, wasSubmittedRef, existingBeneficiaries) &&
      !wasSubmittedRef.current
    )
  );
}

// Controlla se è necessario mostrare errori di validazione
export function shouldSkipValidation<T extends FieldValues>(
  context: ValidationContext<T>
): boolean {
  return !shouldShowValidationErrors(
    context.id,
    context.isSubmitted,
    context.wasSubmittedRef,
    context.existingBeneficiaries
  );
}

// Helper per costruire un path tipizzato per i campi del form
export function buildFieldPath<T extends FieldValues, K extends string>(
  fieldNamePrefix: string,
  index: number,
  field: K
): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

// Verifica se un campo ha errori
export function hasFieldError<T extends FieldValues>(
  fieldName: string,
  context: ValidationContext<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }

  // Per questi campi, mostra sempre gli errori, anche se il form non è stato inviato
  if (
    fieldName === 'amount' ||
    fieldName === 'iban' ||
    fieldName === 'postalAccount'
  ) {
    return getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).hasError;
  }

  // Per gli altri campi, segui la logica standard
  return (
    context.isSubmitted &&
    getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).hasError
  );
}

// Ottiene il messaggio di errore di un campo
export function getFieldErrorMessage<T extends FieldValues>(
  fieldName: string,
  context: ValidationContext<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }

  // Per questi campi, mostra sempre i messaggi di errore, anche se il form non è stato inviato
  if (
    fieldName === 'amount' ||
    fieldName === 'iban' ||
    fieldName === 'postalAccount'
  ) {
    return getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).errorMessage;
  }

  // Per gli altri campi, segui la logica standard
  return context.isSubmitted
    ? getErrorData(
        context.errors,
        context.fieldNamePrefix,
        context.index,
        fieldName
      ).errorMessage
    : '';
}

// Ottiene un campo dal form
export function getFieldValue<T extends FieldValues, K extends string>(
  context: ValidationContext<T>,
  field: K
): string {
  return context.getValues(
    buildFieldPath<T, K>(context.fieldNamePrefix, context.index, field)
  );
}

// Verifica i pagamenti (IBAN e conto postale)
export function checkPaymentFields<T extends FieldValues>(
  context: ValidationContext<T>
): { iban: string; postalAccount: string; bothEmpty: boolean } {
  const iban = getFieldValue(context, 'iban');
  const postalAccount = getFieldValue(context, 'postalAccount');
  const bothEmpty = isEmpty(iban) && isEmpty(postalAccount);

  return { iban, postalAccount, bothEmpty };
}

// Valida un singolo importo
export function validateSingleAmount<T extends FieldValues>(
  value: string,
  context: ValidationContext<T>
): string | undefined {
  const amount = parseFloat(value);
  if (
    isRecentlyCreated(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
    !context.wasSubmittedRef.current
  ) {
    return undefined;
  }
  if (isNaN(amount) || amount <= 0) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.amount.invalid'
    );
  }
  return undefined;
}

// Crea regole di validazione base per i campi
export function createBaseValidationRule(
  wasSubmittedRef: React.RefObject<boolean>,
  validator: (value: string) => string | undefined
) {
  return (value: string): string | undefined => {
    // Non validare se non è stato fatto submit
    if (wasSubmittedRef.current === false) {
      return undefined;
    }
    return validator(value);
  };
}

// Regole per la validazione dei metodi di pagamento
export function createPaymentMethodValidator(
  getOtherFieldValue: () => string,
  validator: (value1: string, value2: string) => string | undefined
) {
  return (value: string): string | undefined => {
    const otherValue = getOtherFieldValue();
    // Se uno dei due è valorizzato, non mostrare errori
    if (!isEmpty(value) || !isEmpty(otherValue)) {
      return undefined;
    }
    return validator(value, otherValue);
  };
}
