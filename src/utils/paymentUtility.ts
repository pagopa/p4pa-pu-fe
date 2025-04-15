/**
 * File di utility per la gestione dei pagamenti
 * Contiene funzioni helper riutilizzabili
 */
import { FieldErrors, FieldValues, Path } from 'react-hook-form';
import { BeneficiaryValidationContext } from '../models/paymentTypes';

/**
 * Verifica se un valore di stringa è vuoto
 * @param value Valore da verificare
 * @returns True se il valore è vuoto o non è una stringa
 */
export function isEmpty(value?: string | unknown): boolean {
  if (typeof value !== 'string') {
    return true;
  }
  return !value || value.trim() === '';
}

/**
 * Helper per costruire un path tipizzato per i campi del form
 * @param fieldNamePrefix Prefisso del campo (es. 'beneficiaries')
 * @param index Indice dell'elemento
 * @param field Nome del campo
 * @returns Path tipizzato per react-hook-form
 */
export function buildFieldPath<T extends FieldValues, K extends string>(
  fieldNamePrefix: string,
  index: number,
  field: K
): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

/**
 * Ottiene i dati di errore dal form
 * @param errors Oggetto errori del form
 * @param fieldNamePrefix Prefisso del campo
 * @param index Indice dell'elemento
 * @param fieldName Nome del campo
 * @returns Oggetto con hasError e errorMessage
 */
export function getErrorData<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldNamePrefix: string,
  index: number,
  fieldName: string
): { hasError: boolean; errorMessage: string } {
  // Gestione del caso speciale per beneficiari all'interno di rate
  if (fieldNamePrefix.includes('installments')) {
    try {
      const parts = fieldNamePrefix.split('.');
      const installmentIndex = parseInt(parts[1], 10);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const installmentErrors = (errors as any)?.installments?.[
        installmentIndex
      ];

      if (
        installmentErrors &&
        installmentErrors.beneficiaries &&
        installmentErrors.beneficiaries[index]
      ) {
        const beneficiaryErrors = installmentErrors.beneficiaries[index];
        const hasError = !!beneficiaryErrors?.[fieldName];
        const errorMessage = beneficiaryErrors?.[fieldName]?.message || '';

        return { hasError, errorMessage };
      }
    } catch (error) {
      // Gestione silenziosa dell'errore
    }
  }

  // Caso standard
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

/**
 * Verifica se un beneficiario è nuovo (aggiunto dopo il submit)
 */
export function isBeneficiaryNew(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return !!wasSubmittedRef.current && !existingBeneficiaries[id];
}

/**
 * Determina se mostrare errori di validazione per un campo
 */
export function hasFieldError<T extends FieldValues>(
  fieldName: string,
  context: BeneficiaryValidationContext<T>
): boolean {
  // Determina se è necessario saltare la validazione
  const shouldSkip =
    !context.isSubmitted ||
    (isBeneficiaryNew(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
      !context.wasSubmittedRef.current);

  if (shouldSkip) {
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

/**
 * Ottiene il messaggio di errore di un campo
 */
export function getFieldErrorMessage<T extends FieldValues>(
  fieldName: string,
  context: BeneficiaryValidationContext<T>
): string {
  // Determina se è necessario saltare la validazione
  const shouldSkip =
    !context.isSubmitted ||
    (isBeneficiaryNew(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
      !context.wasSubmittedRef.current);

  if (shouldSkip) {
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

/**
 * Ottiene un campo dal form
 */
export function getFieldValue<T extends FieldValues, K extends string>(
  context: BeneficiaryValidationContext<T>,
  field: K
): string {
  return context.getValues(
    buildFieldPath<T, K>(context.fieldNamePrefix, context.index, field)
  );
}

/**
 * Formatta un importo come stringa in formato valuta
 * @param amount Importo da formattare
 * @returns Importo formattato
 */
export function formatAmount(amount: string | number): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(',', '.'));
  }

  if (isNaN(amount)) {
    return '0,00';
  }

  return amount.toFixed(2).replace('.', ',');
}

/**
 * Verifica se la somma degli importi dei beneficiari è uguale all'importo totale
 * @param beneficiaries Lista dei beneficiari
 * @param totalAmount Importo totale
 * @returns True se la somma è valida
 */
export function validateBeneficiariesTotal(
  beneficiaries: Array<{ amount: string }>,
  totalAmount: string
): boolean {
  if (!beneficiaries || beneficiaries.length === 0) {
    return false;
  }

  // Normalizza le cifre (converte virgole in punti)
  const total = parseFloat(totalAmount.replace(',', '.'));

  // Calcola la somma degli importi
  const sum = beneficiaries.reduce((acc, ben) => {
    const amount = ben.amount ? parseFloat(ben.amount.replace(',', '.')) : 0;
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Arrotonda a 2 decimali per evitare problemi di precisione
  const roundedSum = Math.round(sum * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  return roundedSum === roundedTotal;
}
