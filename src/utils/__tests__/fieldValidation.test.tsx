import { describe, it, expect, vi } from 'vitest';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA,
  isValidIBAN,
  createBeneficiaryFieldValidators,
  createAmountValidator,
  isBeneficiariesTotalValid,
  createBeneficiaryValidators
} from '../fieldValidation';

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

    it('validates IBAN with different formats that match the regex pattern', () => {
      expect(isValidIBAN('IT60X0542811101000000123456')).toBe(true);
      expect(isValidIBAN('DE89370400440532013000')).toBe(true);
      expect(isValidIBAN('IT60A1234512345')).toBe(true);
      expect(isValidIBAN('IT60A12345123451234567890123456789')).toBe(true);
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

    it('rejects IBAN with invalid regex pattern', () => {
      expect(isValidIBAN('IT60#0542811101000000123456')).toBe(false);
      expect(isValidIBAN('60XIT0542811101000000123456')).toBe(false);
      expect(isValidIBAN('I60X0542811101000000123456')).toBe(false);
    });
  });
});

describe('createAmountValidator', () => {
  const mockT = vi.fn((key: string) => key);
  const validator = createAmountValidator(mockT);

  it('creates a required rule with the correct message', () => {
    expect(validator.required.value).toBe(true);
    expect(validator.required.message).toBe(
      'debtPositionCreateWizard.step3.amount.required'
    );
  });

  describe('validate.positive', () => {
    it('returns true for empty values', () => {
      expect(validator.validate.positive('')).toBe(true);
    });

    it('returns true for positive values', () => {
      expect(validator.validate.positive('10.5')).toBe(true);
    });

    it('returns error message for non-positive values', () => {
      expect(validator.validate.positive('0')).toBe(
        'debtPositionCreateWizard.step3.amount.positive'
      );
      expect(validator.validate.positive('-10')).toBe(
        'debtPositionCreateWizard.step3.amount.positive'
      );
    });
  });

  describe('validate.validNumber', () => {
    it('returns true for empty values', () => {
      expect(validator.validate.validNumber('')).toBe(true);
    });

    it('returns true for valid numbers', () => {
      expect(validator.validate.validNumber('10')).toBe(true);
      expect(validator.validate.validNumber('10.5')).toBe(true);
    });

    it('returns error message for non-numeric values', () => {
      expect(validator.validate.validNumber('abc')).toBe(
        'debtPositionCreateWizard.step3.amount.validNumber'
      );
    });
  });
});

describe('isBeneficiariesTotalValid', () => {
  it('returns true if array is empty', () => {
    expect(isBeneficiariesTotalValid([], '100')).toBe(true);
  });

  it('returns true if totalAmount is empty', () => {
    expect(isBeneficiariesTotalValid([{ amount: '50' }], '')).toBe(true);
  });

  it('returns true if sum is less than total with single beneficiary', () => {
    expect(isBeneficiariesTotalValid([{ amount: '50' }], '100')).toBe(true);
  });

  it('returns false if sum equals total with single beneficiary', () => {
    expect(isBeneficiariesTotalValid([{ amount: '100' }], '100')).toBe(false);
  });

  it('returns false if sum is greater than total with single beneficiary', () => {
    expect(isBeneficiariesTotalValid([{ amount: '150' }], '100')).toBe(false);
  });

  it('returns true if sum is less than total with multiple beneficiaries', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: '40' }, { amount: '50' }], '100')
    ).toBe(true);
  });

  it('returns false if sum equals total with multiple beneficiaries', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: '40' }, { amount: '60' }], '100')
    ).toBe(false);
  });

  it('returns false if sum is greater than total with multiple beneficiaries', () => {
    expect(
      isBeneficiariesTotalValid([{ amount: '60' }, { amount: '60' }], '100')
    ).toBe(false);
  });

  it('handles beneficiaries with invalid amounts (non-numeric or empty)', () => {
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

    it('returns true when beneficiary is null', () => {
      mockGetValues.mockReturnValue(null);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );
      expect(validators.isSingleBeneficiaryAmountValid(true)).toBe(true);
    });

    it('returns true when beneficiary amount is null or undefined', () => {
      mockGetValues.mockReturnValue([{ amount: null }]);
      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
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

    it('returns result of isSingleBeneficiaryAmountValid when hasSingleBeneficiary is true', () => {
      mockGetValues.mockReturnValue([{ amount: '50' }]);

      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );

      expect(validators.isBeneficiaryAmountValid(0, true)).toBe(true);

      mockGetValues.mockReturnValue([{ amount: '100' }]);

      const validators2 = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );

      expect(validators2.isBeneficiaryAmountValid(0, true)).toBe(false);
    });

    it('verifica valore positivo e validità del totale per beneficiari multipli', () => {
      mockGetValues.mockReturnValue([{ amount: '30' }, { amount: '40' }]);

      const validators = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );

      expect(validators.isBeneficiaryAmountValid(0, false)).toBe(true);

      mockGetValues.mockReturnValue([{ amount: '50' }, { amount: '50' }]);

      const validators2 = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );

      expect(validators2.isBeneficiaryAmountValid(0, false)).toBe(false);

      mockGetValues.mockReturnValue([{ amount: '0' }, { amount: '40' }]);

      const validators3 = createBeneficiaryValidators(
        mockT,
        mockGetValues,
        'beneficiaries',
        '100'
      );

      expect(validators3.isBeneficiaryAmountValid(0, false)).toBe(false);
    });
  });
});

describe('createBeneficiaryFieldValidators', () => {
  const mockT = vi.fn((key: string) => key);
  const validators = createBeneficiaryFieldValidators(mockT);

  describe('validateBeneficiaryTaxCode', () => {
    it('returns error message if field is empty', () => {
      expect(validators.validateBeneficiaryTaxCode('')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.vat.required'
      );
    });

    it('returns error message if tax code is not valid', () => {
      expect(validators.validateBeneficiaryTaxCode('RSSMRA80A01H501U')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.vat.invalid'
      );
    });

    it('returns undefined if VAT number is valid', () => {
      expect(
        validators.validateBeneficiaryTaxCode('12345678901')
      ).toBeUndefined();
    });

    it('returns error message if tax code/VAT number is not valid', () => {
      expect(validators.validateBeneficiaryTaxCode('INVALID')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.vat.invalid'
      );
    });
  });

  describe('validateIBAN', () => {
    it('returns undefined if field is empty', () => {
      expect(validators.validateIBAN('')).toBeUndefined();
    });

    it('returns undefined if IBAN is valid', () => {
      expect(
        validators.validateIBAN('IT60X0542811101000000123456')
      ).toBeUndefined();
    });

    it('returns error message if IBAN is not valid', () => {
      expect(validators.validateIBAN('INVALID')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.iban.invalid'
      );
    });
  });

  describe('validatePaymentMethod', () => {
    it('returns error message if both IBAN and postal account are empty', () => {
      expect(validators.validatePaymentMethod('', '')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
      expect(validators.validatePaymentMethod('', '')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });

    it('returns error message if IBAN is invalid', () => {
      expect(validators.validatePaymentMethod('INVALID_IBAN')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.iban.invalid'
      );
    });

    it('returns undefined when IBAN is valid', () => {
      expect(
        validators.validatePaymentMethod('IT60X0542811101000000123456')
      ).toBeUndefined();
    });

    it('returns undefined when postal account is present even if IBAN is missing', () => {
      expect(validators.validatePaymentMethod('', '123456')).toBeUndefined();
    });
  });

  describe('validateRemittance', () => {
    it('returns error message if remittance is empty', () => {
      expect(validators.validateRemittance('')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.remittance.required'
      );
    });

    it('returns error message if remittance contains only spaces', () => {
      expect(validators.validateRemittance('   ')).toBe(
        'debtPositionCreateWizard.step3.beneficiary.remittance.required'
      );
    });

    it('returns undefined if remittance is valid', () => {
      expect(validators.validateRemittance('Valid remittance')).toBeUndefined();
    });
  });
});
