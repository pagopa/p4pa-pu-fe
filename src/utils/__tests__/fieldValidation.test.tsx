import { describe, it, expect } from 'vitest';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA,
  validateTaxCode
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

describe('validateTaxCode', () => {
  describe('Valid Cases', () => {
    it('validates codice fiscale for persona fisica', () => {
      expect(validateTaxCode('RSSMRA80A01H501U', 'fisica')).toBe(true);
    });

    it('validates partita IVA for persona giuridica', () => {
      expect(validateTaxCode('12345678901', 'giuridica')).toBe(true);
    });

    it('validates with spaces in the code', () => {
      expect(validateTaxCode('RSS MRA 80A01 H501 U', 'fisica')).toBe(true);
      expect(validateTaxCode('123 456 789 01', 'giuridica')).toBe(true);
    });
  });

  describe('Invalid Cases', () => {
    it('rejects empty value', () => {
      expect(validateTaxCode('', 'fisica')).toBe('commons.required');
      expect(validateTaxCode('', 'giuridica')).toBe('commons.required');
    });

    it('rejects invalid codice fiscale for persona fisica', () => {
      expect(validateTaxCode('12345678901', 'fisica')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalid'
      );
    });

    it('rejects invalid partita IVA for persona giuridica', () => {
      expect(validateTaxCode('RSSMRA80A01H501U', 'giuridica')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalidVAT'
      );
    });

    it('rejects partita IVA with wrong length for persona giuridica', () => {
      expect(validateTaxCode('123456789', 'giuridica')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalidVAT'
      );
    });
  });
});
