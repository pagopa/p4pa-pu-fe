import { describe, it, expect, vi } from 'vitest';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA,
  validateTaxCode,
  createValidators,
  isValidIBAN,
  isValidPostalAccount,
  createBeneficiaryFieldValidators,
  createAmountValidator,
  isBeneficiariesTotalValid,
  createBeneficiaryValidators,
  createDateValidator,
  SubjectType
} from '../fieldValidation';
import { ValidationErrorCode } from '../../store/types';

describe('isValidCodiceFiscale', () => {
  describe('Valid Cases', () => {
    it('validates a correct codice fiscale', () => {
      expect(isValidCodiceFiscale('RSSMRA80A01H501U')).toBe(true);
    });

    it('validates codice fiscale with spaces', () => {
      expect(isValidCodiceFiscale('RSS MRA 80A01 H501 U')).toBe(true);
    });

    it('validates codice fiscale in lowercase', () => {
      expect(isValidCodiceFiscale('rssmra80a01h501u')).toBe(true);
    });
  });

  describe('Invalid Cases', () => {
    it('rejects empty string', () => {
      expect(isValidCodiceFiscale('')).toBe(false);
    });

    it('rejects null value', () => {
      expect(isValidCodiceFiscale(null as unknown as string)).toBe(false);
    });

    it('rejects codice fiscale with wrong length', () => {
      expect(isValidCodiceFiscale('RSSMRA80A01H501')).toBe(false);
    });

    it('rejects codice fiscale with invalid characters', () => {
      expect(isValidCodiceFiscale('RSSMRA80A01H501@')).toBe(false);
    });

    it('rejects codice fiscale with wrong format', () => {
      expect(isValidCodiceFiscale('1234567890123456')).toBe(false);
    });
  });
});

describe('isValidPartitaIVA', () => {
  describe('Valid Cases', () => {
    it('validates a correct partita IVA', () => {
      expect(isValidPartitaIVA('12345678901')).toBe(true);
    });

    it('validates partita IVA with spaces', () => {
      expect(isValidPartitaIVA('123 456 789 01')).toBe(true);
    });
  });

  describe('Invalid Cases', () => {
    it('rejects empty string', () => {
      expect(isValidPartitaIVA('')).toBe(false);
    });

    it('rejects null value', () => {
      expect(isValidPartitaIVA(null as unknown as string)).toBe(false);
    });

    it('rejects partita IVA with wrong length', () => {
      expect(isValidPartitaIVA('123456789')).toBe(false);
    });

    it('rejects partita IVA with non-numeric characters', () => {
      expect(isValidPartitaIVA('1234567890A')).toBe(false);
    });
  });
});

describe('validateTaxCode', () => {
  describe('Valid Cases', () => {
    it('validates codice fiscale for persona fisica', () => {
      expect(validateTaxCode('RSSMRA80A01H501U', SubjectType.INDIVIDUAL)).toBe(
        ValidationErrorCode.VALID
      );
    });

    it('validates partita IVA for persona giuridica', () => {
      expect(validateTaxCode('12345678901', SubjectType.BUSINESS)).toBe(
        ValidationErrorCode.VALID
      );
    });

    it('validates with spaces in the code', () => {
      expect(
        validateTaxCode('RSS MRA 80A01 H501 U', SubjectType.INDIVIDUAL)
      ).toBe(ValidationErrorCode.VALID);
      expect(validateTaxCode('123 456 789 01', SubjectType.BUSINESS)).toBe(
        ValidationErrorCode.VALID
      );
    });
  });

  describe('Invalid Cases', () => {
    it('rejects empty value', () => {
      expect(validateTaxCode('', SubjectType.INDIVIDUAL)).toBe(
        ValidationErrorCode.REQUIRED
      );
      expect(validateTaxCode('', SubjectType.BUSINESS)).toBe(
        ValidationErrorCode.REQUIRED
      );
    });

    it('rejects invalid codice fiscale for persona fisica', () => {
      expect(validateTaxCode('12345678901', SubjectType.INDIVIDUAL)).toBe(
        ValidationErrorCode.INVALID_CF
      );
    });

    it('rejects invalid partita IVA for persona giuridica', () => {
      expect(validateTaxCode('RSSMRA80A01H501U', SubjectType.BUSINESS)).toBe(
        ValidationErrorCode.INVALID_VAT
      );
    });

    it('rejects partita IVA with wrong length for persona giuridica', () => {
      expect(validateTaxCode('123456789', SubjectType.BUSINESS)).toBe(
        ValidationErrorCode.INVALID_VAT
      );
    });
  });
});

describe('createValidators', () => {
  // Mock translation function
  const mockT = vi.fn((key: string) => key);

  describe('validateTaxCodeField', () => {
    it('returns generic message when field is empty and subject type is not selected', () => {
      const { validateTaxCodeField } = createValidators(mockT, '');
      expect(validateTaxCodeField('')).toBe(
        'debtPositionCreateWizard.step2.taxCodeOrVat.required'
      );
    });

    it('returns specific message for natural person when field is empty', () => {
      const { validateTaxCodeField } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      expect(validateTaxCodeField('')).toBe(
        'debtPositionCreateWizard.step2.taxCode.required'
      );
    });

    it('returns specific message for legal entity when field is empty', () => {
      const { validateTaxCodeField } = createValidators(
        mockT,
        SubjectType.BUSINESS
      );
      expect(validateTaxCodeField('')).toBe(
        'debtPositionCreateWizard.step2.vat.required'
      );
    });

    it('returns undefined when tax code is valid for natural person', () => {
      const { validateTaxCodeField } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      expect(validateTaxCodeField('RSSMRA80A01H501U')).toBeUndefined();
    });

    it('returns undefined when VAT number is valid for legal entity', () => {
      const { validateTaxCodeField } = createValidators(
        mockT,
        SubjectType.BUSINESS
      );
      expect(validateTaxCodeField('12345678901')).toBeUndefined();
    });

    it('returns error message when tax code is invalid for natural person', () => {
      const { validateTaxCodeField } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      expect(validateTaxCodeField('12345678901')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalid'
      );
    });

    it('returns error message when VAT number is invalid for legal entity', () => {
      const { validateTaxCodeField } = createValidators(
        mockT,
        SubjectType.BUSINESS
      );
      expect(validateTaxCodeField('RSSMRA80A01H501U')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalidVAT'
      );
    });
  });

  describe('validateFullNameField', () => {
    it('returns generic message when field is empty and subject type is not selected', () => {
      const { validateFullNameField } = createValidators(mockT, '');
      expect(validateFullNameField('')).toBe(
        'debtPositionCreateWizard.step2.fullName.required'
      );
    });

    it('returns specific message for natural person when field is empty', () => {
      const { validateFullNameField } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      expect(validateFullNameField('')).toBe(
        'debtPositionCreateWizard.step2.fullName.required'
      );
    });

    it('returns specific message for legal entity when field is empty', () => {
      const { validateFullNameField } = createValidators(
        mockT,
        SubjectType.BUSINESS
      );
      expect(validateFullNameField('')).toBe(
        'debtPositionCreateWizard.step2.companyName.required'
      );
    });

    it('returns undefined when full name is valid (at least two words)', () => {
      const { validateFullNameField } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      expect(validateFullNameField('Mario Rossi')).toBeUndefined();
    });

    it('returns error message when full name has less than two words', () => {
      const { validateFullNameField } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      expect(validateFullNameField('Mario')).toBe(
        'debtPositionCreateWizard.step2.fullName.minTwoWords'
      );
    });
  });

  describe('getValidationRules', () => {
    it('returns correct validation rules', () => {
      const { getValidationRules } = createValidators(
        mockT,
        SubjectType.INDIVIDUAL
      );
      const rules = getValidationRules();

      expect(rules).toHaveProperty('taxCode');
      expect(rules).toHaveProperty('fullName');
      expect(rules).toHaveProperty('subjectType');

      expect(rules.taxCode).toHaveProperty('validate');
      expect(rules.fullName).toHaveProperty('validate');
      expect(rules.subjectType).toHaveProperty('required');

      expect(rules.subjectType.required).toBe(
        'debtPositionCreateWizard.step2.subjectType.required'
      );
    });
  });
});

describe('isValidIBAN', () => {
  describe('Valid Cases', () => {
    it('validates a correct IBAN', () => {
      expect(isValidIBAN('IT60X0542811101000000123456')).toBe(true);
    });

    it('validates IBAN with spaces', () => {
      expect(isValidIBAN('IT60 X054 2811 1010 0000 0123 456')).toBe(true);
    });

    it('validates IBAN in lowercase', () => {
      expect(isValidIBAN('it60x0542811101000000123456')).toBe(true);
    });
  });

  describe('Invalid Cases', () => {
    it('rejects empty string', () => {
      expect(isValidIBAN('')).toBe(false);
    });

    it('rejects null value', () => {
      expect(isValidIBAN(null as unknown as string)).toBe(false);
    });

    it('rejects IBAN with wrong length (too short)', () => {
      expect(isValidIBAN('IT60X05428111')).toBe(false);
    });

    it('rejects IBAN with wrong length (too long)', () => {
      expect(isValidIBAN('IT60X0542811101000000123456789012345678901234')).toBe(
        false
      );
    });

    it('rejects IBAN with invalid format', () => {
      expect(isValidIBAN('IT60@0542811101000000123456')).toBe(false);
    });
  });
});

describe('isValidPostalAccount', () => {
  describe('Valid Cases', () => {
    it('validates a correct postal account number with 12 digits', () => {
      expect(isValidPostalAccount('123456789012')).toBe(true);
    });

    it('validates a correct postal account number with 6 digits', () => {
      expect(isValidPostalAccount('123456')).toBe(true);
    });

    it('validates postal account with spaces', () => {
      expect(isValidPostalAccount('1234 5678 9012')).toBe(true);
    });
  });

  describe('Invalid Cases', () => {
    it('rejects empty string', () => {
      expect(isValidPostalAccount('')).toBe(false);
    });

    it('rejects null value', () => {
      expect(isValidPostalAccount(null as unknown as string)).toBe(false);
    });

    it('rejects postal account with wrong length (too short)', () => {
      expect(isValidPostalAccount('12345')).toBe(false);
    });

    it('rejects postal account with wrong length (too long)', () => {
      expect(isValidPostalAccount('1234567890123')).toBe(false);
    });

    it('rejects postal account with non-numeric characters', () => {
      expect(isValidPostalAccount('12345A789012')).toBe(false);
    });
  });
});

describe('createAmountValidator', () => {
  const mockT = vi.fn((key: string) => key);
  const validator = createAmountValidator(mockT);

  it('crea una regola required con il messaggio corretto', () => {
    expect(validator.required.value).toBe(true);
    expect(validator.required.message).toBe(
      'debtPositionCreateWizard.step3.amount.required'
    );
  });

  describe('validate.positive', () => {
    it('restituisce true per valori vuoti', () => {
      expect(validator.validate.positive('')).toBe(true);
    });

    it('restituisce true per valori positivi', () => {
      expect(validator.validate.positive('10.5')).toBe(true);
    });

    it('restituisce messaggio di errore per valori non positivi', () => {
      expect(validator.validate.positive('0')).toBe(
        'debtPositionCreateWizard.step3.amount.positive'
      );
      expect(validator.validate.positive('-10')).toBe(
        'debtPositionCreateWizard.step3.amount.positive'
      );
    });
  });

  describe('validate.validNumber', () => {
    it('restituisce true per valori vuoti', () => {
      expect(validator.validate.validNumber('')).toBe(true);
    });

    it('restituisce true per numeri validi', () => {
      expect(validator.validate.validNumber('10')).toBe(true);
      expect(validator.validate.validNumber('10.5')).toBe(true);
    });

    it('restituisce messaggio di errore per valori non numerici', () => {
      expect(validator.validate.validNumber('abc')).toBe(
        'debtPositionCreateWizard.step3.amount.validNumber'
      );
    });
  });
});

describe('isBeneficiariesTotalValid', () => {
  it("restituisce true se l'array è vuoto", () => {
    expect(isBeneficiariesTotalValid([], '100')).toBe(true);
  });

  it('restituisce true se il totalAmount è vuoto', () => {
    expect(isBeneficiariesTotalValid([{ amount: '50' }], '')).toBe(true);
  });

  it('restituisce true se la somma è inferiore al totale con un singolo beneficiario', () => {
    expect(isBeneficiariesTotalValid([{ amount: '50' }], '100')).toBe(true);
  });

  it('restituisce false se la somma è uguale al totale con un singolo beneficiario', () => {
    expect(isBeneficiariesTotalValid([{ amount: '100' }], '100')).toBe(false);
  });

  it('restituisce false se la somma è superiore al totale con un singolo beneficiario', () => {
    expect(isBeneficiariesTotalValid([{ amount: '150' }], '100')).toBe(false);
  });

  it('restituisce true se la somma è inferiore al totale con più beneficiari', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: '40' }, { amount: '50' }], '100')
    ).toBe(true);
  });

  it('restituisce false se la somma è uguale al totale con più beneficiari', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: '40' }, { amount: '60' }], '100')
    ).toBe(false);
  });

  it('restituisce false se la somma è superiore al totale con più beneficiari', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: '60' }, { amount: '60' }], '100')
    ).toBe(false);
  });

  it('gestisce beneficiari con importi non validi (non numerici o vuoti)', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: 'abc' }, { amount: '50' }], '100')
    ).toBe(true);
    expect(
      isBeneficiariesTotalValid([{ amount: '' }, { amount: '50' }], '100')
    ).toBe(true);
  });
});

describe('createBeneficiaryValidators', () => {
  const mockT = vi.fn((key: string) => key);
  const mockGetValues = vi.fn();

  beforeEach(() => {
    mockGetValues.mockReset();
  });

  describe('validateTotalAmount', () => {
    it('returns true if totalAmount is empty', () => {
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        ''
      );
      expect(validators.validateTotalAmount()).toBe(true);
    });

    it('returns true if there are no beneficiaries', () => {
      mockGetValues.mockReturnValue([]);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.validateTotalAmount()).toBe(true);
    });

    it('returns true if sum is less than total', () => {
      mockGetValues.mockReturnValue([{ amount: '40' }, { amount: '50' }]);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.validateTotalAmount()).toBe(true);
    });

    it('returns error message if sum is equal to or greater than total', () => {
      mockGetValues.mockReturnValue([{ amount: '50' }, { amount: '50' }]);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.validateTotalAmount()).toBe(
        'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal'
      );
    });
  });

  describe('validateSingleBeneficiary', () => {
    it('returns true if there are multiple beneficiaries', () => {
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.validateSingleBeneficiary('50', 2)).toBe(true);
    });

    it('returns true if amount is less than total with single beneficiary', () => {
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.validateSingleBeneficiary('50', 1)).toBe(true);
    });

    it('returns error message if amount is equal to or greater than total with single beneficiary', () => {
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.validateSingleBeneficiary('100', 1)).toBe(
        'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
      );
    });
  });

  // Adding other tests for remaining functions
  describe('isSingleBeneficiaryAmountValid', () => {
    it('returns true if hasSingleBeneficiary is false', () => {
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.isSingleBeneficiaryAmountValid(false)).toBe(true);
    });

    it('returns true if totalAmount is empty', () => {
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        ''
      );
      expect(validators.isSingleBeneficiaryAmountValid(true)).toBe(true);
    });
  });

  describe('isBeneficiaryAmountValid', () => {
    it('returns true if beneficiary does not exist', () => {
      mockGetValues.mockReturnValue([]);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.isBeneficiaryAmountValid(0, false)).toBe(true);
    });

    it('returns true if beneficiary amount is empty', () => {
      mockGetValues.mockReturnValue([{ amount: '' }]);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.isBeneficiaryAmountValid(0, false)).toBe(true);
    });
  });
});

describe('createBeneficiaryFieldValidators', () => {
  const mockT = vi.fn((key: string) => key);
  const validators = createBeneficiaryFieldValidators(mockT);

  describe('validateBeneficiaryTaxCode', () => {
    it('restituisce messaggio di errore se il campo è vuoto', () => {
      expect(validators.validateBeneficiaryTaxCode('')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.taxCode.required'
      );
    });

    it('restituisce undefined se il codice fiscale è valido', () => {
      expect(
        validators.validateBeneficiaryTaxCode('RSSMRA80A01H501U')
      ).toBeUndefined();
    });

    it('restituisce undefined se la partita IVA è valida', () => {
      expect(
        validators.validateBeneficiaryTaxCode('12345678901')
      ).toBeUndefined();
    });

    it('restituisce messaggio di errore se il codice fiscale/partita IVA non è valido', () => {
      expect(validators.validateBeneficiaryTaxCode('INVALID')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.taxCode.invalid'
      );
    });
  });

  describe('validateIBAN', () => {
    it('restituisce undefined se il campo è vuoto', () => {
      expect(validators.validateIBAN('')).toBeUndefined();
    });

    it("restituisce undefined se l'IBAN è valido", () => {
      expect(
        validators.validateIBAN('IT60X0542811101000000123456')
      ).toBeUndefined();
    });

    it("restituisce messaggio di errore se l'IBAN non è valido", () => {
      expect(validators.validateIBAN('INVALID')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.iban.invalid'
      );
    });
  });

  describe('validatePostalAccount', () => {
    it('restituisce undefined se il campo è vuoto', () => {
      expect(validators.validatePostalAccount('')).toBeUndefined();
    });

    it('restituisce undefined se il conto corrente postale è valido', () => {
      expect(validators.validatePostalAccount('123456789012')).toBeUndefined();
    });

    it('restituisce messaggio di errore se il conto corrente postale non è valido', () => {
      expect(validators.validatePostalAccount('INVALID')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.postalAccount.invalid'
      );
    });
  });

  describe('validatePaymentMethod', () => {
    it('restituisce undefined se IBAN è presente', () => {
      expect(
        validators.validatePaymentMethod('IT60X0542811101000000123456', '')
      ).toBeUndefined();
    });

    it('restituisce undefined se conto corrente postale è presente', () => {
      expect(
        validators.validatePaymentMethod('', '123456789012')
      ).toBeUndefined();
    });

    it('restituisce undefined se entrambi i metodi sono presenti', () => {
      expect(
        validators.validatePaymentMethod(
          'IT60X0542811101000000123456',
          '123456789012'
        )
      ).toBeUndefined();
    });

    it('restituisce messaggio di errore se entrambi i campi sono vuoti', () => {
      expect(validators.validatePaymentMethod('', '')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });

    it('restituisce messaggio di errore se entrambi i campi contengono solo spazi', () => {
      expect(validators.validatePaymentMethod(' ', '  ')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });
  });
});

describe('createDateValidator', () => {
  const mockT = vi.fn((key: string) => key);

  describe('when field is required', () => {
    const validator = createDateValidator(mockT, true);

    it('returns default error message if field is required but empty', () => {
      expect(validator.required).toBe('commons.required');
    });

    it('returns custom message if provided', () => {
      const customValidator = createDateValidator(
        mockT,
        true,
        'custom.message'
      );
      expect(customValidator.required).toBe('custom.message');
    });

    it('returns true if value is a valid date', () => {
      const value = new Date();
      expect(validator.validate(value)).toBe(true);
    });

    it('returns error message if value is not a valid date', () => {
      expect(validator.validate('invalid-date')).toBe(
        'debtPositionCreateWizard.step3.dueDate.invalid'
      );
    });
  });

  describe('when field is not required', () => {
    const validator = createDateValidator(mockT, false);

    it('returns false if field is not required', () => {
      expect(validator.required).toBe(false);
    });

    it('returns true if field is empty and not required', () => {
      expect(validator.validate(null)).toBe(true);
      expect(validator.validate(undefined)).toBe(true);
    });

    it('returns true if value is a valid date', () => {
      const value = new Date();
      expect(validator.validate(value)).toBe(true);
    });

    it('returns error message if value is present but not a valid date', () => {
      expect(validator.validate('invalid-date')).toBe(
        'debtPositionCreateWizard.step3.dueDate.invalid'
      );
    });
  });
});
