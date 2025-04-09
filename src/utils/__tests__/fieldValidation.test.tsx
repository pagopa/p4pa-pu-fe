import { describe, it, expect, vi } from 'vitest';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA,
  validateTaxCode,
  createValidators
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
      expect(validateTaxCode('RSSMRA80A01H501U', 'fisica')).toBe(
        ValidationErrorCode.VALID
      );
    });

    it('validates partita IVA for persona giuridica', () => {
      expect(validateTaxCode('12345678901', 'giuridica')).toBe(
        ValidationErrorCode.VALID
      );
    });

    it('validates with spaces in the code', () => {
      expect(validateTaxCode('RSS MRA 80A01 H501 U', 'fisica')).toBe(
        ValidationErrorCode.VALID
      );
      expect(validateTaxCode('123 456 789 01', 'giuridica')).toBe(
        ValidationErrorCode.VALID
      );
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

describe('createValidators', () => {
  // Mock della funzione di traduzione
  const mockT = vi.fn((key: string) => key);

  describe('validateTaxCodeField', () => {
    it('restituisce il messaggio generico quando il campo è vuoto e non è selezionato il tipo di soggetto', () => {
      const { validateTaxCodeField } = createValidators(mockT, '');
      expect(validateTaxCodeField('')).toBe(
        'debtPositionCreateWizard.step2.taxCodeOrVat.required'
      );
    });

    it('restituisce il messaggio specifico per persona fisica quando il campo è vuoto', () => {
      const { validateTaxCodeField } = createValidators(mockT, 'fisica');
      expect(validateTaxCodeField('')).toBe(
        'debtPositionCreateWizard.step2.taxCode.required'
      );
    });

    it('restituisce il messaggio specifico per persona giuridica quando il campo è vuoto', () => {
      const { validateTaxCodeField } = createValidators(mockT, 'giuridica');
      expect(validateTaxCodeField('')).toBe(
        'debtPositionCreateWizard.step2.vat.required'
      );
    });

    it('restituisce undefined quando il codice fiscale è valido per persona fisica', () => {
      const { validateTaxCodeField } = createValidators(mockT, 'fisica');
      expect(validateTaxCodeField('RSSMRA80A01H501U')).toBeUndefined();
    });

    it('restituisce undefined quando la partita IVA è valida per persona giuridica', () => {
      const { validateTaxCodeField } = createValidators(mockT, 'giuridica');
      expect(validateTaxCodeField('12345678901')).toBeUndefined();
    });

    it('restituisce il messaggio di errore quando il codice fiscale non è valido per persona fisica', () => {
      const { validateTaxCodeField } = createValidators(mockT, 'fisica');
      expect(validateTaxCodeField('12345678901')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalid'
      );
    });

    it('restituisce il messaggio di errore quando la partita IVA non è valida per persona giuridica', () => {
      const { validateTaxCodeField } = createValidators(mockT, 'giuridica');
      expect(validateTaxCodeField('RSSMRA80A01H501U')).toBe(
        'debtPositionCreateWizard.step2.taxCode.invalidVAT'
      );
    });
  });

  describe('validateFullNameField', () => {
    it('restituisce il messaggio generico quando il campo è vuoto e non è selezionato il tipo di soggetto', () => {
      const { validateFullNameField } = createValidators(mockT, '');
      expect(validateFullNameField('')).toBe(
        'debtPositionCreateWizard.step2.fullName.required'
      );
    });

    it('restituisce il messaggio specifico per persona fisica quando il campo è vuoto', () => {
      const { validateFullNameField } = createValidators(mockT, 'fisica');
      expect(validateFullNameField('')).toBe(
        'debtPositionCreateWizard.step2.fullName.required'
      );
    });

    it('restituisce il messaggio specifico per persona giuridica quando il campo è vuoto', () => {
      const { validateFullNameField } = createValidators(mockT, 'giuridica');
      expect(validateFullNameField('')).toBe(
        'debtPositionCreateWizard.step2.companyName.required'
      );
    });

    it('restituisce undefined quando il nome completo è valido (almeno due parole)', () => {
      const { validateFullNameField } = createValidators(mockT, 'fisica');
      expect(validateFullNameField('Mario Rossi')).toBeUndefined();
    });

    it('restituisce il messaggio di errore quando il nome completo ha meno di due parole', () => {
      const { validateFullNameField } = createValidators(mockT, 'fisica');
      expect(validateFullNameField('Mario')).toBe(
        'debtPositionCreateWizard.step2.fullName.minTwoWords'
      );
    });
  });

  describe('getValidationRules', () => {
    it('restituisce le regole di validazione corrette', () => {
      const { getValidationRules } = createValidators(mockT, 'fisica');
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
