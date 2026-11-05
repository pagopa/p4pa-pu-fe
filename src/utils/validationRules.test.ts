import { describe, it, expect, beforeEach } from 'vitest';
import {
  createIBANValidationRules,
  validateLogoBeforeSubmit
} from './validationRules';
import { i18nTestSetup } from '../__tests__/i18nTestSetup';

const translations = {
  organizationEditWizard: {
    step2: {
      iban: {
        invalid: 'IBAN non valido',
        required: 'IBAN obbligatorio'
      }
    },
    step1: {
      orgLogo: {
        required: 'Il logo è obbligatorio'
      }
    }
  }
};

type ValidationRuleMock = Record<string, (str: string) => void>;
const t = (key: string) => key;

describe('validationRules', () => {
  beforeEach(() => {
    i18nTestSetup(translations);
  });

  describe('createIBANValidationRules', () => {
    it('returns true for an empty IBAN value', () => {
      const rules = createIBANValidationRules();
      const result = (rules.validate as ValidationRuleMock).validIBAN('');

      expect(result).toBe(true);
    });

    it('returns true for a valid IBAN', () => {
      const rules = createIBANValidationRules();
      const result = (rules.validate as ValidationRuleMock).validIBAN(
        'IT60X0542811101000000123456'
      );

      expect(result).toBe(true);
    });

    it('returns the translated error message for an invalid IBAN', () => {
      const rules = createIBANValidationRules();
      const result = (rules.validate as ValidationRuleMock).validIBAN(
        'invalid-iban'
      );

      expect(result).toBe('IBAN non valido');
    });

    it('adds the required rule when isRequired is true', () => {
      const rules = createIBANValidationRules(true);

      expect(rules.required).toEqual({
        value: true,
        message: 'IBAN obbligatorio'
      });
    });

    it('does not add the required rule when isRequired is false', () => {
      const rules = createIBANValidationRules(false);

      expect(rules.required).toBeUndefined();
    });
  });

  describe('validateLogoBeforeSubmit', () => {
    it('is valid for a DRAFT organization without a logo', () => {
      const result = validateLogoBeforeSubmit(null, null, 'DRAFT', t);

      expect(result.isValid).toBe(true);
      expect(result.shouldPreventSubmit).toBe(false);
    });

    it('prevents submission for ACTIVE when the logo was removed', () => {
      const result = validateLogoBeforeSubmit(
        null,
        'existing-logo',
        'ACTIVE',
        t
      );

      expect(result.isValid).toBe(false);
      expect(result.shouldPreventSubmit).toBe(true);
      expect(result.errorMessage).toBe(
        'organizationEditWizard.step1.orgLogo.required'
      );
    });

    it('prevents submission for ACTIVE when no logo exists at all', () => {
      const result = validateLogoBeforeSubmit(null, null, 'ACTIVE', t);

      expect(result.isValid).toBe(false);
      expect(result.shouldPreventSubmit).toBe(true);
      expect(result.errorMessage).toBe(
        'organizationEditWizard.step1.orgLogo.required'
      );
    });

    it('is valid for ACTIVE when a new logo file is uploaded', () => {
      const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });

      const result = validateLogoBeforeSubmit(logoFile, null, 'ACTIVE', t);

      expect(result.isValid).toBe(true);
      expect(result.shouldPreventSubmit).toBe(false);
    });

    it('is valid for ACTIVE when the existing logo is kept unchanged', () => {
      const logoFile = new File(['logo'], 'logo.png', { type: 'image/png' });

      const result = validateLogoBeforeSubmit(
        logoFile,
        'existing-logo',
        'ACTIVE',
        t
      );

      expect(result.isValid).toBe(true);
      expect(result.shouldPreventSubmit).toBe(false);
    });
  });
});
