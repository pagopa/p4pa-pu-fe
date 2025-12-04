import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createIBANValidationRules,
  validateLogoBeforeSubmit
} from '../validationRules';
import { UnifiedFormData } from '../../models/OrganizationEditTypes';

vi.mock('../fieldValidation', () => ({
  isValidIBAN: vi.fn((iban: string) => {
    if (!iban) return false;
    const normalized = iban.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(normalized);
  })
}));

describe('validationRules', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'organizationEditWizard.step2.iban.invalid': 'IBAN non valido',
      'organizationEditWizard.step2.iban.required': 'IBAN obbligatorio',
      'organizationEditWizard.step1.orgLogo.required': 'Il logo è obbligatorio'
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIBANValidationRules', () => {
    it('should return validation rules without required when isRequired is false', () => {
      const rules = createIBANValidationRules(mockT, false);

      expect(rules).toHaveProperty('validate');
      expect(rules).toHaveProperty('validate.validIBAN');
      expect(rules).not.toHaveProperty('required');
    });

    it('should return validation rules with required when isRequired is true', () => {
      const rules = createIBANValidationRules(mockT, true);

      expect(rules).toHaveProperty('validate');
      expect(rules).toHaveProperty('validate.validIBAN');
      expect(rules).toHaveProperty('required');
      expect(
        (rules as { required: { value: boolean; message: string } }).required
      ).toEqual({
        value: true,
        message: 'IBAN obbligatorio'
      });
    });

    it('should call translation function for invalid IBAN message', () => {
      const rules = createIBANValidationRules(mockT, false);
      const validateFn = (
        rules as {
          validate: { validIBAN: (value: string) => unknown };
        }
      ).validate.validIBAN;

      validateFn('INVALID_IBAN');

      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.iban.invalid'
      );
    });

    it('should call translation function for required message when isRequired is true', () => {
      createIBANValidationRules(mockT, true);

      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.iban.required'
      );
    });

    it('should validate empty string as valid when not required', () => {
      const rules = createIBANValidationRules(mockT, false);
      const validateFn = (
        rules as {
          validate: { validIBAN: (value: string) => unknown };
        }
      ).validate.validIBAN;

      const result = validateFn('');

      expect(result).toBe(true);
    });

    it('should validate valid IBAN correctly', () => {
      const rules = createIBANValidationRules(mockT, false);
      const validateFn = (
        rules as {
          validate: { validIBAN: (value: string) => unknown };
        }
      ).validate.validIBAN;

      const result = validateFn('IT60X0542811101000000123456');

      expect(result).toBe(true);
    });

    it('should validate invalid IBAN and return error message', () => {
      const rules = createIBANValidationRules(mockT, false);
      const validateFn = (
        rules as {
          validate: { validIBAN: (value: string) => unknown };
        }
      ).validate.validIBAN;

      const result = validateFn('INVALID_IBAN');

      expect(result).toBe('IBAN non valido');
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.iban.invalid'
      );
    });

    it('should handle IBAN with spaces and lowercase', () => {
      const rules = createIBANValidationRules(mockT, false);
      const validateFn = (
        rules as {
          validate: { validIBAN: (value: string) => unknown };
        }
      ).validate.validIBAN;

      const result = validateFn('it 60 x0542811101000000123456');

      expect(result).toBe(true);
    });
  });

  describe('validateLogoBeforeSubmit', () => {
    const createMockFile = (name = 'logo.png'): File => {
      return new File(['logo content'], name, { type: 'image/png' });
    };

    describe('ACTIVE organization status', () => {
      it('should fail validation when logo was removed (existing logo, logoFile null)', () => {
        const existingLogo = 'data:image/png;base64,existingLogoBase64';
        const logoFile = null;
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'ACTIVE';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(false);
        expect(result.shouldPreventSubmit).toBe(true);
        expect(result.errorMessage).toBe('Il logo è obbligatorio');
        expect(mockT).toHaveBeenCalledWith(
          'organizationEditWizard.step1.orgLogo.required'
        );
      });

      it('should fail validation when no logo exists and no file uploaded', () => {
        const existingLogo = null;
        const logoFile = null;
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'ACTIVE';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(false);
        expect(result.shouldPreventSubmit).toBe(true);
        expect(result.errorMessage).toBe('Il logo è obbligatorio');
      });

      it('should pass validation when new logo is uploaded (existing logo, logoFile present)', () => {
        const existingLogo = 'data:image/png;base64,existingLogoBase64';
        const logoFile = createMockFile();
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'ACTIVE';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(true);
        expect(result.shouldPreventSubmit).toBe(false);
        expect(result.errorMessage).toBeUndefined();
      });

      it('should pass validation when new logo is uploaded (no existing logo, logoFile present)', () => {
        const existingLogo = null;
        const logoFile = createMockFile();
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'ACTIVE';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(true);
        expect(result.shouldPreventSubmit).toBe(false);
        expect(result.errorMessage).toBeUndefined();
      });
    });

    describe('DRAFT organization status', () => {
      it('should pass validation when logo is removed (logo optional for DRAFT)', () => {
        const existingLogo = 'data:image/png;base64,existingLogoBase64';
        const logoFile = null;
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'DRAFT';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(true);
        expect(result.shouldPreventSubmit).toBe(false);
        expect(result.errorMessage).toBeUndefined();
      });

      it('should pass validation when no logo exists (logo optional for DRAFT)', () => {
        const existingLogo = null;
        const logoFile = null;
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'DRAFT';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(true);
        expect(result.shouldPreventSubmit).toBe(false);
        expect(result.errorMessage).toBeUndefined();
      });

      it('should pass validation when logo is uploaded (logo optional for DRAFT)', () => {
        const existingLogo = null;
        const logoFile = createMockFile();
        const organizationStatus: UnifiedFormData['organizationStatus'] =
          'DRAFT';

        const result = validateLogoBeforeSubmit(
          logoFile,
          existingLogo,
          organizationStatus,
          mockT
        );

        expect(result.isValid).toBe(true);
        expect(result.shouldPreventSubmit).toBe(false);
        expect(result.errorMessage).toBeUndefined();
      });
    });
  });
});
