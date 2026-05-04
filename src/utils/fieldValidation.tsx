// Definition of the SubjectType enum
export enum SubjectType {
  INDIVIDUAL = 'F',
  BUSINESS = 'G'
}

/**
 * Checks if an Italian tax code is valid
 * @param cf - Tax code to validate
 * @returns true if the tax code is valid, false otherwise
 */
export const isValidCodiceFiscale = (cf: string): boolean => {
  // If the tax code is empty or null, immediately returns false
  if (!cf) return false;
  // Normalizes the tax code:
  // - Removes all spaces using a regular expression (/\s/g)
  // - Converts everything to uppercase for uniformity
  cf = cf.replace(/\s/g, '').toUpperCase();

  // Checks that the length is exactly 16 characters (Italian tax code standard)
  if (cf.length !== 16) return false;

  // Checks that the format respects the Italian tax code schema:
  // - First 6 positions: letters (surname and name)
  // - Positions 7-8: numbers (year of birth)
  // - Position 9: letter (month of birth)
  // - Positions 10-11: numbers (day of birth + gender code)
  // - Position 12: letter (cadastral code of municipality/foreign country)
  // - Positions 13-15: numbers (individual code)
  // - Position 16: letter (control character)
  const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;

  // Verifies the format using the regular expression and returns the result
  return regex.test(cf);
};

/**
 * Checks if an email address is valid
 * @param email - Email address to validate
 * @returns true if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  // If the email is empty or null, immediately returns false
  if (!email) return false;

  // Normalizes the email by trimming whitespace
  email = email.trim();

  // Standard email validation regex pattern
  // Checks for: alphanumeric + special chars @ domain . extension
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  // Verifies the format using the regular expression and returns the result
  return regex.test(email);
};

/**
 * Determines if the Partita IVA check digit validation should be enabled
 * The check digit validation is enabled only in PROD environment
 * @returns true if check digit validation should be enabled (PROD), false otherwise (DEV/UAT/LOCAL)
 */
export const isPIVACheckEnabled = (): boolean => {
  return import.meta.env.ENV === 'PROD';
};

/**
 * Validates the check digit of an Italian VAT number using the Luhn algorithm
 * @param pi - VAT number (must be 11 digits, already normalized)
 * @returns true if the check digit is valid, false otherwise
 */
const validatePIVACheckDigit = (pi: string): boolean => {
  let sum = 0;

  // Sum digits in even positions (0, 2, 4, 6, 8)
  for (let i = 0; i <= 8; i += 2) {
    sum += parseInt(pi[i], 10);
  }

  // Digits in odd positions (1, 3, 5, 7, 9): multiply by 2 and adjust
  for (let i = 1; i <= 9; i += 2) {
    let doubled = parseInt(pi[i], 10) * 2;
    if (doubled > 9) {
      doubled -= 9; // e.g., 8*2=16 -> 16-9=7
    }
    sum += doubled;
  }

  // Verify check digit (last digit)
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(pi[10], 10);
};

/**
 * Checks if an Italian VAT number is valid
 * @param piva - VAT number to validate
 * @returns true if the VAT number is valid, false otherwise
 * @remarks
 * - In PROD environment: validates format (11 digits) + check digit (Luhn algorithm)
 * - In DEV/UAT/LOCAL environments: validates only format (11 digits)
 */
export const isValidPartitaIVA = (piva: string): boolean => {
  // 1. Basic checks
  if (!piva) {
    return false;
  }

  // Normalizes the VAT number by removing all spaces
  piva = piva.replace(/\s/g, '');

  // 2. Check length after normalization
  if (piva.length !== 11) {
    return false;
  }

  // 3. Verify that all characters are digits
  if (!/^\d{11}$/.test(piva)) {
    return false;
  }

  // 4. If check is disabled, stop here
  if (!isPIVACheckEnabled()) {
    return true;
  }

  // 5. Luhn algorithm for checksum validation
  return validatePIVACheckDigit(piva);
};

/**
 * Normalizes a fiscal code or VAT number by removing spaces and converting to uppercase
 * @param value - Fiscal code, VAT number, or "ANONIMO" to normalize
 * @returns Normalized value (spaces removed, uppercase)
 */
export const normalizeFiscalCodeOrPIVA = (value: string): string => {
  if (!value) {
    return '';
  }
  return value.replace(/\s/g, '').toUpperCase();
};

/**
 * Removes all spaces from a string without altering case.
 * Useful for compacting identifiers like IUV/IUF.
 */
export const normalizeCompact = (value: string): string => {
  if (!value) {
    return '';
  }
  return value.replace(/\s/g, '');
};

/**
 * Validates a fiscal code or VAT number, accepting also "ANONIMO" as valid value
 * This function is used in search forms where anonymous subjects are allowed
 * @param value - Fiscal code, VAT number, or "ANONIMO" to validate
 * @returns true if the value is valid (CF, P.IVA, or "ANONIMO"), false otherwise
 */
export const isValidFiscalCodeOrPIVA = (value: string): boolean => {
  if (!value) {
    return false;
  }

  // Normalize the value by removing spaces and converting to uppercase
  const normalizedValue = normalizeFiscalCodeOrPIVA(value);

  // Accept "ANONIMO" as valid (case-insensitive)
  if (normalizedValue === 'ANONIMO') {
    return true;
  }

  // Otherwise, validate as Codice Fiscale or Partita IVA
  return (
    isValidCodiceFiscale(normalizedValue) || isValidPartitaIVA(normalizedValue)
  );
};

/**
 * Creates validation rules for an amount field
 * @param t - Translation function
 * @returns Object with validation rules for react-hook-form
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
 * Checks if the sum of amounts is less than the total amount
 * @param beneficiaries - Array of beneficiaries
 * @param totalAmount - Total amount
 * @returns true if the sum is less than the total amount, false otherwise
 */
export const isBeneficiariesTotalValid = (
  beneficiaries: Array<{ amount: string }>,
  totalAmount: string
): boolean => {
  if (!totalAmount || beneficiaries.length === 0) {
    return true;
  }

  const total = parseFloat(totalAmount);

  // If there is only one beneficiary, its amount must be less than the total amount
  if (beneficiaries.length === 1) {
    const beneficiaryAmount = parseFloat(beneficiaries[0].amount) || 0;
    return beneficiaryAmount < total;
  }

  // For multiple beneficiaries, check that the sum is less than the total amount
  let sum = 0;
  beneficiaries.forEach((beneficiary) => {
    const amount = parseFloat(beneficiary.amount) || 0;
    sum += amount;
  });

  return sum < total;
};

/**
 * Creates validation functions for beneficiary amounts
 * @param t - Translation function
 * @param getValues - Function to get values from form fields
 * @param fieldNamePrefix - Field name prefix
 * @param totalAmount - Total amount
 * @returns Object with validation functions
 */
export const createBeneficiaryValidators = (
  t: (key: string) => string,
  getValues: <T>(fieldName: string) => T,
  fieldNamePrefix: string,
  totalAmount: string
) => {
  // Checks if the sum of amounts is less than the total amount
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

  // Checks if the single beneficiary amount is valid
  const isSingleBeneficiaryAmountValid = (hasSingleBeneficiary: boolean) => {
    if (!hasSingleBeneficiary || !totalAmount) return true;

    const beneficiary =
      getValues<Array<{ amount: string }>>(fieldNamePrefix)?.[0];
    if (!beneficiary) return true;

    const beneficiaryAmount = parseFloat(beneficiary.amount) || 0;
    const total = parseFloat(totalAmount);

    return beneficiaryAmount < total;
  };

  // Validation to check that the sum of amounts is less than the total amount
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

  // Validation for a single beneficiary
  const validateSingleBeneficiary = (amount: string, fieldsLength: number) => {
    if (fieldsLength === 1 && totalAmount) {
      const beneficiaryAmount = parseFloat(amount) || 0;
      const total = parseFloat(totalAmount);

      const result =
        beneficiaryAmount < total ||
        t(
          'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
        );

      return result;
    }
    return true;
  };

  // Checks if a single beneficiary has a valid amount
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

/**
 * Checks if an IBAN is valid
 * @param iban - IBAN to validate
 * @returns true if the IBAN is valid, false otherwise
 */
export const isValidIBAN = (iban: string): boolean => {
  if (!iban) return false;

  // Normalizes the IBAN by removing spaces and converting to uppercase
  iban = iban.replace(/\s/g, '').toUpperCase();

  // Basic length check (minimum 27 characters, maximum 34 according to ISO 13616 standard)
  if (iban.length < 27 || iban.length > 34) return false;

  // Basic format for IBAN: two letters for country code, two check digits,
  // and then the BBAN (Basic Bank Account Number)
  const regex = /^[A-Z]{2}\d{2}[A-Z0-9]{23,30}$/;

  // Verification with regular expression
  return regex.test(iban);
};

/**
 * Creates validation functions for beneficiary fields
 * @param t - Translation function
 * @returns Object with validation functions
 */
export const createBeneficiaryFieldValidators = (
  t: (key: string) => string
) => {
  // Validation for tax code field
  const validateBeneficiaryTaxCode = (value: string): string | undefined => {
    if (!value) {
      return t('debtPositionCreateWizard.step3.beneficiary.vat.required');
    }

    if (!isValidPartitaIVA(value)) {
      return t('debtPositionCreateWizard.step3.beneficiary.vat.invalid');
    }

    return undefined;
  };

  // Common validation function for optional IBAN fields
  const validateOptionalIBAN = (value: string): string | undefined => {
    if (!value) return undefined; // The field is optional

    if (!isValidIBAN(value)) {
      return t('debtPositionCreateWizard.step3.beneficiary.iban.invalid');
    }

    return undefined;
  };

  // Validation for IBAN field
  const validateIBAN = validateOptionalIBAN;

  // Validation for postalIban field
  const validatePostalIban = validateOptionalIBAN;

  // Validation for at least one payment method present (either IBAN or postal account)
  const validatePaymentMethod = (
    iban: string,
    postalAccount?: string
  ): string | undefined => {
    if (!iban && !postalAccount) {
      return t(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    }
    if (iban && !isValidIBAN(iban)) {
      return t('debtPositionCreateWizard.step3.beneficiary.iban.invalid');
    }
    return undefined;
  };

  // Validation for remittance field
  const validateRemittance = (value: string): string | undefined => {
    if (!value || value.trim() === '') {
      return t(
        'debtPositionCreateWizard.step3.beneficiary.remittance.required'
      );
    }

    return undefined;
  };

  return {
    validateBeneficiaryTaxCode,
    validateIBAN,
    validatePostalIban,
    validatePaymentMethod,
    validateRemittance
  };
};
