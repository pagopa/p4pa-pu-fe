// Funzioni di validazione per codice fiscale e partita IVA

import { ValidationErrorCode } from '../store/types';

// enum per il tipo di soggetto
export enum SubjectType {
  INDIVIDUAL = 'fisica',
  BUSINESS = 'giuridica'
}

/**
 * Verifica se un codice fiscale italiano è valido
 * @param cf - Codice fiscale da validare
 * @returns true se il codice fiscale è valido, false altrimenti
 */
export const isValidCodiceFiscale = (cf: string): boolean => {
  // Se il codice fiscale è vuoto o null, restituisce falso immediatamente
  if (!cf) return false;
  // Normalizza il codice fiscale:
  // - Rimuove tutti gli spazi usando un'espressione regolare (/\s/g)
  // - Converte tutto in maiuscolo per uniformità
  cf = cf.replace(/\s/g, '').toUpperCase();

  // Verifica che la lunghezza sia esattamente 16 caratteri (standard CF italiano)
  if (cf.length !== 16) return false;

  // Controlla che il formato rispetti lo schema del codice fiscale italiano:
  // - Prime 6 posizioni: lettere (cognome e nome)
  // - Posizioni 7-8: numeri (anno di nascita)
  // - Posizione 9: lettera (mese di nascita)
  // - Posizioni 10-11: numeri (giorno di nascita + codice genere)
  // - Posizione 12: lettera (codice catastale comune/stato estero)
  // - Posizioni 13-15: numeri (codice individuale)
  // - Posizione 16: lettera (carattere di controllo)
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

  // Verifica il formato usando l'espressione regolare e restituisce il risultato
  return regex.test(cf);
};

/**
 * Verifica se una partita IVA italiana è valida
 * @param piva - Partita IVA da validare
 * @returns true se la partita IVA è valida, false altrimenti
 */
export const isValidPartitaIVA = (piva: string): boolean => {
  // Se la partita IVA è vuota o null, restituisce falso immediatamente
  if (!piva) return false;

  // Normalizza la partita IVA rimuovendo tutti gli spazi
  piva = piva.replace(/\s/g, '');

  // Verifica che:
  // 1. La lunghezza sia esattamente 11 caratteri (standard P.IVA italiana)
  // 2. Sia composta solo da cifre numeriche (0-9)
  // Nota: questa validazione controlla solo il formato
  return piva.length === 11 && /^\d{11}$/.test(piva);
};

export const validateTaxCode = (
  value: string,
  subjectType: string
): ValidationErrorCode => {
  if (!value) return ValidationErrorCode.REQUIRED;

  const normalizedValue = value.replace(/\s/g, '').toUpperCase();

  switch (subjectType) {
    case SubjectType.INDIVIDUAL:
      if (!isValidCodiceFiscale(normalizedValue)) {
        return ValidationErrorCode.INVALID_CF;
      }
      break;
    case SubjectType.BUSINESS:
      if (!isValidPartitaIVA(normalizedValue)) {
        return ValidationErrorCode.INVALID_VAT;
      }
      break;
    default:
      return ValidationErrorCode.INVALID_CF;
  }

  return ValidationErrorCode.VALID;
};

/**
 * Crea le regole di validazione per un campo importo
 * @param t - Funzione di traduzione
 * @returns Oggetto con regole di validazione per react-hook-form
 */
export const createAmountValidator = (t: (key: string) => string) => {
  return {
    required: {
      value: true,
      message: t('debtPositionCreateWizard.step3.amount.required')
    },
    validate: {
      positive: (value: string) => {
        if (!value) return true;
        const numValue = parseFloat(value);
        return (
          numValue > 0 || t('debtPositionCreateWizard.step3.amount.positive')
        );
      },
      validNumber: (value: string) => {
        if (!value) return true;
        return (
          !isNaN(parseFloat(value)) ||
          t('debtPositionCreateWizard.step3.amount.validNumber')
        );
      }
    }
  };
};

/**
 * Verifica se la somma degli importi è inferiore all'importo totale
 * @param beneficiaries - Array di beneficiari
 * @param totalAmount - Importo totale
 * @returns true se la somma è inferiore all'importo totale, false altrimenti
 */
export const isBeneficiariesTotalValid = (
  beneficiaries: Array<{ amount: string }>,
  totalAmount: string
): boolean => {
  if (!totalAmount || beneficiaries.length === 0) return true;

  const total = parseFloat(totalAmount);

  // Se c'è un solo beneficiario, il suo importo deve essere inferiore all'importo totale
  if (beneficiaries.length === 1) {
    const beneficiaryAmount = parseFloat(beneficiaries[0].amount) || 0;
    return beneficiaryAmount < total;
  }

  // Per più beneficiari, verifica che la somma sia inferiore all'importo totale
  const sum = beneficiaries.reduce((acc, curr) => {
    return acc + (parseFloat(curr.amount) || 0);
  }, 0);

  return sum < total;
};

/**
 * Crea le funzioni di validazione per gli importi dei beneficiari
 * @param t - Funzione di traduzione
 * @param getValues - Funzione per ottenere i valori dai campi del form
 * @param fieldNamePrefix - Prefisso del nome del campo
 * @param totalAmount - Importo totale
 * @returns Oggetto con funzioni di validazione
 */
export const createBeneficiaryValidators = (
  t: (key: string) => string,
  getValues: <T>(fieldName: string) => T,
  fieldNamePrefix: string,
  totalAmount: string
) => {
  // Verifica se la somma degli importi è inferiore all'importo totale
  const isValidTotalAmount = () => {
    if (!totalAmount) return true;

    const beneficiaries =
      getValues<Array<{ amount: string }>>(fieldNamePrefix) || [];
    if (beneficiaries.length === 0) return true;

    const sum = beneficiaries.reduce(
      (acc: number, curr: { amount: string }) => {
        const amount = parseFloat(curr.amount) || 0;
        return acc + amount;
      },
      0
    );

    return sum < parseFloat(totalAmount);
  };

  // Verifica se l'importo del beneficiario singolo è valido
  const isSingleBeneficiaryAmountValid = (hasSingleBeneficiary: boolean) => {
    if (!hasSingleBeneficiary || !totalAmount) return true;

    const beneficiary =
      getValues<Array<{ amount: string }>>(fieldNamePrefix)?.[0];
    if (!beneficiary) return true;

    const beneficiaryAmount = parseFloat(beneficiary.amount) || 0;
    const total = parseFloat(totalAmount);

    return beneficiaryAmount < total;
  };

  // Validazione per verificare che la somma degli importi sia inferiore all'importo totale
  const validateTotalAmount = () => {
    if (!totalAmount) return true;

    const beneficiaries =
      getValues<Array<{ amount: string }>>(fieldNamePrefix) || [];
    if (beneficiaries.length === 0) return true;

    const sum = beneficiaries.reduce(
      (acc: number, curr: { amount: string }) => {
        const amount = parseFloat(curr.amount) || 0;
        return acc + amount;
      },
      0
    );

    return (
      sum < parseFloat(totalAmount) ||
      t('debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal')
    );
  };

  // Validazione per un singolo beneficiario
  const validateSingleBeneficiary = (amount: string, fieldsLength: number) => {
    if (fieldsLength === 1 && totalAmount) {
      const beneficiaryAmount = parseFloat(amount) || 0;
      const total = parseFloat(totalAmount);
      return (
        beneficiaryAmount < total ||
        t(
          'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
        )
      );
    }
    return true;
  };

  // Verifica se un singolo beneficiario ha un importo valido
  const isBeneficiaryAmountValid = (
    index: number,
    hasSingleBeneficiary: boolean
  ) => {
    const beneficiaries =
      getValues<Array<{ amount: string }>>(fieldNamePrefix) || [];
    const beneficiary = beneficiaries[index];

    if (!beneficiary || !beneficiary.amount) return true;

    if (hasSingleBeneficiary) {
      return isSingleBeneficiaryAmountValid(hasSingleBeneficiary);
    }

    return parseFloat(beneficiary.amount) > 0 && isValidTotalAmount();
  };

  return {
    isValidTotalAmount,
    isSingleBeneficiaryAmountValid,
    validateTotalAmount,
    validateSingleBeneficiary,
    isBeneficiaryAmountValid
  };
};

// functions per la validazione dei campi
export const createValidators = (
  t: (key: string) => string,
  subjectTypeValue: string
) => {
  // Funzione di validazione per il codice fiscale / partita IVA
  const validateTaxCodeField = (value: string): string | undefined => {
    // Se il campo è vuoto, restituisce il messaggio appropriato in base al tipo di soggetto
    if (!value) {
      // Se non è stato selezionato il tipo di soggetto, mostra il messaggio generico
      if (!subjectTypeValue) {
        return t('debtPositionCreateWizard.step2.taxCodeOrVat.required');
      }
      // Altrimenti mostrare il messaggio specifico in base al tipo di soggetto
      return subjectTypeValue !== SubjectType.BUSINESS
        ? t('debtPositionCreateWizard.step2.taxCode.required')
        : t('debtPositionCreateWizard.step2.vat.required');
    }
    // Altrimenti, valida il formato
    const result = validateTaxCode(value, subjectTypeValue);

    if (result == 'commons.required') {
      // Se non è stato selezionato il tipo di soggetto, mostra il messaggio generico
      if (!subjectTypeValue) {
        return t('debtPositionCreateWizard.step2.taxCodeOrVat.required');
      }
      // Altrimenti mostra il messaggio specifico in base al tipo di soggetto
      return subjectTypeValue !== SubjectType.BUSINESS
        ? t('debtPositionCreateWizard.step2.taxCode.required')
        : t('debtPositionCreateWizard.step2.vat.required');
    }

    // Restituisce il risultato della validazione
    return result === ValidationErrorCode.VALID ? undefined : t(result);
  };

  //Funzione di validazione per il nome completo / ragione sociale
  const validateFullNameField = (value: string): string | undefined => {
    // Se il campo è vuoto, restituisce il messaggio appropriato in base al tipo di soggetto
    if (!value) {
      // Se non è stato selezionato il tipo di soggetto, mostra il messaggio generico
      if (!subjectTypeValue) {
        return t('debtPositionCreateWizard.step2.fullName.required');
      }
      // Altrimenti mostrare il messaggio specifico in base al tipo di soggetto
      return subjectTypeValue !== SubjectType.BUSINESS
        ? t('debtPositionCreateWizard.step2.fullName.required')
        : t('debtPositionCreateWizard.step2.companyName.required');
    }

    // Validazione per il formato del nome (almeno due parole)
    const trimmed = value.trim();
    if (trimmed.split(' ').length < 2) {
      return t('debtPositionCreateWizard.step2.fullName.minTwoWords');
    }

    return undefined;
  };

  // Factory per le regole di validazione per React Hook Form
  const getValidationRules = () => ({
    taxCode: {
      validate: validateTaxCodeField
    },
    fullName: {
      validate: validateFullNameField
    },
    subjectType: {
      required: t('debtPositionCreateWizard.step2.subjectType.required')
    }
  });

  return {
    validateTaxCodeField,
    validateFullNameField,
    getValidationRules
  };
};

/**
 * Verifica se un IBAN è valido
 * @param iban - IBAN da validare
 * @returns true se l'IBAN è valido, false altrimenti
 */
export const isValidIBAN = (iban: string): boolean => {
  if (!iban) return false;

  // Normalizza l'IBAN rimuovendo spazi e convertendo in maiuscolo
  iban = iban.replace(/\s/g, '').toUpperCase();

  // Controllo di base sulla lunghezza (tra 15 e 34 caratteri secondo lo standard ISO 13616)
  if (iban.length < 15 || iban.length > 34) return false;

  // Formato base per IBAN: due lettere per il codice paese, due cifre di controllo,
  // e poi il BBAN (Basic Bank Account Number)
  const regex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;

  // Verifica con espressione regolare
  return regex.test(iban);
};

/**
 * Verifica se un numero di conto corrente postale italiano è valido
 * @param postalAccount - Numero di conto corrente postale da validare
 * @returns true se il numero è valido, false altrimenti
 */
export const isValidPostalAccount = (postalAccount: string): boolean => {
  if (!postalAccount) return false;

  // Normalizza il numero di conto corrente rimuovendo spazi
  postalAccount = postalAccount.replace(/\s/g, '');

  // I conti correnti postali italiani sono composti da 12 cifre numeriche
  // oppure da numeri più brevi (minimo 6 cifre)
  return /^\d{6,12}$/.test(postalAccount);
};

/**
 * Crea funzioni di validazione per i campi del beneficiario
 * @param t - Funzione di traduzione
 * @returns Oggetto con funzioni di validazione
 */
export const createBeneficiaryFieldValidators = (
  t: (key: string) => string
) => {
  // Validazione per il campo del codice fiscale
  const validateBeneficiaryTaxCode = (value: string): string | undefined => {
    if (!value) return undefined; // Il campo non è richiesto

    // Verifica sia codice fiscale che partita IVA
    const normalizedValue = value.replace(/\s/g, '').toUpperCase();
    if (
      isValidCodiceFiscale(normalizedValue) ||
      isValidPartitaIVA(normalizedValue)
    ) {
      return undefined;
    }

    return t('debtPositionCreateWizard.step3.beneficiary.taxCode.invalid');
  };

  // Validazione per il campo IBAN
  const validateIBAN = (value: string): string | undefined => {
    if (!value) return undefined; // Il campo non è richiesto

    if (!isValidIBAN(value)) {
      return t('debtPositionCreateWizard.step3.beneficiary.iban.invalid');
    }

    return undefined;
  };

  // Validazione per il campo del conto corrente postale
  const validatePostalAccount = (value: string): string | undefined => {
    if (!value)
      return t(
        'debtPositionCreateWizard.step3.beneficiary.postalAccount.required'
      );

    if (!isValidPostalAccount(value)) {
      return t(
        'debtPositionCreateWizard.step3.beneficiary.postalAccount.invalid'
      );
    }

    return undefined;
  };

  // Validazione per almeno un metodo di pagamento presente (o IBAN o conto postale)
  const validatePaymentMethod = (
    iban: string,
    postalAccount: string
  ): string | undefined => {
    // Se entrambi sono vuoti, restituiamo un errore
    if (
      (!iban || iban.trim() === '') &&
      (!postalAccount || postalAccount.trim() === '')
    ) {
      return t('debtPositionCreateWizard.step3.beneficiary.iban.required');
    }

    return undefined;
  };

  return {
    validateBeneficiaryTaxCode,
    validateIBAN,
    validatePostalAccount,
    validatePaymentMethod
  };
};
