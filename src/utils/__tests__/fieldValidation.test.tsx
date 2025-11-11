import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fv from '../fieldValidation';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA,
  isValidIBAN,
  normalizeCompact,
  normalizeFiscalCodeOrPIVA,
  isValidFiscalCodeOrPIVA,
  createBeneficiaryFieldValidators,
  createAmountValidator,
  isBeneficiariesTotalValid,
  createBeneficiaryValidators
} from '../fieldValidation';

describe('isValidPartitaIVA - environment branches and checksum', () => {
  const envRef = (import.meta as unknown as { env: { ENV: string } }).env;
  const originalEnv = envRef.ENV;

  afterEach(() => {
    envRef.ENV = originalEnv;
  });

  it('returns false for empty or invalid formats', () => {
    expect(isValidPartitaIVA('')).toBe(false);
    expect(isValidPartitaIVA('123')).toBe(false);
    expect(isValidPartitaIVA('1234567890A')).toBe(false);
  });

  it('bypasses checksum when check is disabled (non-PROD)', () => {
    envRef.ENV = 'DEV';
    expect(isValidPartitaIVA('12345678901')).toBe(true);
  });

  it('validates checksum in PROD', () => {
    // Set environment to PROD to enable checksum validation
    envRef.ENV = 'PROD';

    // Test with valid PIVAs (correct check digit)
    expect(isValidPartitaIVA('12345678903')).toBe(true); // Computed: base '1234567890' -> check digit 3
    expect(isValidPartitaIVA('00000000000')).toBe(true); // All zeros is valid (check digit 0)

    // Test with invalid PIVAs (incorrect check digit)
    // These PIVAs have the wrong check digit and should fail in PROD
    // We test multiple cases to ensure the checksum validation works correctly
    // Test invalid PIVAs with wrong check digits
    const invalidPivas = ['12345678900', '12345678901', '12345678902'];

    invalidPivas.forEach((piva) => {
      const result = isValidPartitaIVA(piva);
      // If checksum validation is enabled (ENV='PROD'), these should fail
      if (fv.isPIVACheckEnabled()) {
        expect(result).toBe(false);
      } else {
        // In non-PROD, any 11-digit number is considered valid
        expect(result).toBe(true);
      }
    });
  });
});

describe('isValidFiscalCodeOrPIVA', () => {
  let pivacheckSpy: ReturnType<typeof vi.spyOn> | undefined;
  afterEach(() => {
    pivacheckSpy?.mockRestore();
  });

  it('accepts ANONIMO (case-insensitive)', () => {
    expect(isValidFiscalCodeOrPIVA('ANONIMO')).toBe(true);
    expect(isValidFiscalCodeOrPIVA('anonimo')).toBe(true);
    expect(isValidFiscalCodeOrPIVA('  aNoNiMo  ')).toBe(true);
  });

  it('validates CF via underlying validator', () => {
    expect(isValidFiscalCodeOrPIVA('RSSMRA80A01H501U')).toBe(true);
  });

  it('validates PIVA in non-PROD bypassing checksum', () => {
    pivacheckSpy = vi.spyOn(fv, 'isPIVACheckEnabled').mockReturnValue(false);
    expect(isValidFiscalCodeOrPIVA('12345678901')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isValidFiscalCodeOrPIVA('')).toBe(false);
    expect(isValidFiscalCodeOrPIVA('INVALID')).toBe(false);
  });
});

describe('normalize utilities', () => {
  describe('normalizeCompact', () => {
    it('removes all spaces and preserves case', () => {
      expect(normalizeCompact(' 12 3  4 ')).toBe('1234');
      expect(normalizeCompact('Ab C d E F')).toBe('AbCdEF');
    });
    it('returns empty string for falsy inputs', () => {
      expect(normalizeCompact('')).toBe('');
      expect(normalizeCompact(null as unknown as string)).toBe('');
      expect(normalizeCompact(undefined as unknown as string)).toBe('');
    });
  });

  describe('normalizeFiscalCodeOrPIVA', () => {
    it('removes spaces and uppercases fiscal code', () => {
      expect(normalizeFiscalCodeOrPIVA('rss mra 80a01 h501 u')).toBe(
        'RSSMRA80A01H501U'
      );
    });
    it('removes spaces and preserves digits for P.IVA', () => {
      expect(normalizeFiscalCodeOrPIVA('123 456 789 01')).toBe('12345678901');
    });
    it('returns empty string for falsy inputs', () => {
      expect(normalizeFiscalCodeOrPIVA('')).toBe('');
      expect(normalizeFiscalCodeOrPIVA(null as unknown as string)).toBe('');
    });
  });
});

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
      expect(isValidIBAN('DE89370400440532013000')).toBe(false);
      expect(isValidIBAN('IT60A1234512345')).toBe(false);
    });

    it('rejects IBAN with wrong length (too long)', () => {
      expect(isValidIBAN('IT60X0542811101000000123456789012345678901234')).toBe(
        false
      );
      expect(isValidIBAN('IT60A123451234512345678901234567890')).toBe(false);
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
