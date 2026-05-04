import { describe, it, expect, vi } from 'vitest';
import { FieldErrors } from 'react-hook-form';
import {
  isEmpty,
  getErrorData,
  isBeneficiaryNew,
  isRecentlyCreated,
  shouldShowValidationErrors,
  shouldSkipValidation,
  buildFieldPath,
  hasFieldError,
  getFieldErrorMessage,
  getFieldValue,
  checkPaymentFields,
  validateSingleAmount,
  createBaseValidationRule,
  createPaymentMethodValidator
} from '../beneficiaryValidation';
import type { BeneficiaryValidationContext } from '../../models/paymentTypes';

describe('beneficiaryValidation', () => {
  describe('isEmpty', () => {
    it('returns true for empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty()).toBe(true);
      expect(isEmpty(null)).toBe(true);
    });

    it('returns false for non-empty values', () => {
      expect(isEmpty('test')).toBe(false);
      expect(isEmpty('0')).toBe(false);
      expect(isEmpty(' test ')).toBe(false);
    });

    it('returns true for non-string values', () => {
      expect(isEmpty(0)).toBe(true);
      expect(isEmpty(123)).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty([])).toBe(true);
    });
  });

  describe('getErrorData', () => {
    it('returns correct error data', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            entityName: {
              message: 'Campo obbligatorio'
            }
          }
        }
      } as unknown as FieldErrors<Record<string, unknown>>;

      const result = getErrorData(mockErrors, 'beneficiaries', 0, 'entityName');
      expect(result).toEqual({
        hasError: true,
        errorMessage: 'Campo obbligatorio'
      });
    });

    it('handles missing errors correctly', () => {
      const mockErrors = {} as FieldErrors<Record<string, unknown>>;

      const result = getErrorData(mockErrors, 'beneficiaries', 0, 'entityName');
      expect(result).toEqual({
        hasError: false,
        errorMessage: ''
      });
    });

    it('correctly handles an error without a message', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            entityName: {}
          }
        }
      } as unknown as FieldErrors<Record<string, unknown>>;

      const result = getErrorData(mockErrors, 'beneficiaries', 0, 'entityName');
      expect(result).toEqual({
        hasError: true,
        errorMessage: ''
      });
    });
  });

  describe('isBeneficiaryNew', () => {
    it('returns true if the beneficiary is new', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        isBeneficiaryNew('id-2', mockWasSubmittedRef, mockExistingBeneficiaries)
      ).toBe(true);
    });

    it('returns false if the beneficiary already exists', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        isBeneficiaryNew('id-1', mockWasSubmittedRef, mockExistingBeneficiaries)
      ).toBe(false);
    });

    it('returns false if wasSubmittedRef is false', () => {
      const mockWasSubmittedRef = { current: false };
      const mockExistingBeneficiaries = {};

      expect(
        isBeneficiaryNew('id-1', mockWasSubmittedRef, mockExistingBeneficiaries)
      ).toBe(false);
    });
  });

  describe('isRecentlyCreated', () => {
    it('returns true if wasSubmittedRef is false', () => {
      const mockWasSubmittedRef = { current: false };
      const mockExistingBeneficiaries = {};

      expect(
        isRecentlyCreated(
          'id-1',
          mockWasSubmittedRef,
          mockExistingBeneficiaries
        )
      ).toBe(true);
    });

    it('returns true if the beneficiary is not in existing beneficiaries', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        isRecentlyCreated(
          'id-2',
          mockWasSubmittedRef,
          mockExistingBeneficiaries
        )
      ).toBe(true);
    });

    it('returns false if the beneficiary is among existing ones and wasSubmittedRef is true', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        isRecentlyCreated(
          'id-1',
          mockWasSubmittedRef,
          mockExistingBeneficiaries
        )
      ).toBe(false);
    });
  });

  describe('shouldShowValidationErrors', () => {
    it('returns true if isSubmitted is true and the beneficiary exists', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        shouldShowValidationErrors(
          'id-1',
          true,
          mockWasSubmittedRef,
          mockExistingBeneficiaries
        )
      ).toBe(true);
    });

    it('returns false if isSubmitted is false', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        shouldShowValidationErrors(
          'id-1',
          false,
          mockWasSubmittedRef,
          mockExistingBeneficiaries
        )
      ).toBe(false);
    });

    it('returns false if the beneficiary is new and wasSubmittedRef is false', () => {
      const mockWasSubmittedRef = { current: false };
      const mockExistingBeneficiaries = {};

      expect(
        shouldShowValidationErrors(
          'id-1',
          true,
          mockWasSubmittedRef,
          mockExistingBeneficiaries
        )
      ).toBe(false);
    });
  });

  describe('shouldSkipValidation', () => {
    it('returns true if validation errors should not be shown', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(shouldSkipValidation(mockContext)).toBe(true);
    });

    it('returns false if validation errors should be shown', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 2,
        creationSubmissionCount: 1
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(shouldSkipValidation(mockContext)).toBe(false);
    });
  });

  describe('buildFieldPath', () => {
    it('builds the field path correctly', () => {
      expect(buildFieldPath('beneficiaries', 0, 'entityName')).toBe(
        'beneficiaries.0.entityName'
      );
      expect(buildFieldPath('items', 3, 'price')).toBe('items.3.price');
    });
  });

  describe('hasFieldError', () => {
    it('returns false if shouldSkipValidation is true', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(hasFieldError('entityName', mockContext)).toBe(false);
    });

    it('returns true if the field has an error', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {
          beneficiaries: {
            0: {
              entityName: {
                message: 'Campo obbligatorio'
              }
            }
          }
        } as unknown as FieldErrors<Record<string, unknown>>,
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 2,
        creationSubmissionCount: 1
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(hasFieldError('entityName', mockContext)).toBe(true);
    });

    it('returns false if the field has no errors', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(hasFieldError('entityName', mockContext)).toBe(false);
    });
  });

  describe('getFieldErrorMessage', () => {
    it('returns empty string if shouldSkipValidation is true', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(getFieldErrorMessage('entityName', mockContext)).toBe('');
    });

    it('returns the error message for a field with an error', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {
          beneficiaries: {
            0: {
              entityName: {
                message: 'Campo obbligatorio'
              }
            }
          }
        } as unknown as FieldErrors<Record<string, unknown>>,
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 2,
        creationSubmissionCount: 1
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(getFieldErrorMessage('entityName', mockContext)).toBe(
        'Campo obbligatorio'
      );
    });

    it('returns empty string if isSubmitted is false', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {
          beneficiaries: {
            0: {
              entityName: {
                message: 'Campo obbligatorio'
              }
            }
          }
        } as unknown as FieldErrors<Record<string, unknown>>,
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(getFieldErrorMessage('entityName', mockContext)).toBe('');
    });
  });

  describe('getFieldValue', () => {
    it('retrieves the value of a field from the context', () => {
      const mockGetValues = vi.fn().mockReturnValue('Test Entity');

      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: mockGetValues,
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getFieldValue(mockContext, 'entityName');

      expect(mockGetValues).toHaveBeenCalledWith('beneficiaries.0.entityName');
      expect(result).toBe('Test Entity');
    });
  });

  describe('checkPaymentFields', () => {
    it('returns payment field values and bothEmpty=true when both are empty', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return '';
          if (path.includes('postalAccount')) return '';
          return 'default-value';
        }),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = checkPaymentFields(mockContext);

      expect(result).toEqual({
        iban: '',
        postalAccount: '',
        bothEmpty: true
      });
    });

    it('returns payment field values and bothEmpty=false when at least one is filled', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return '';
          return 'default-value';
        }),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = checkPaymentFields(mockContext);

      expect(result).toEqual({
        iban: 'IT60X0542811101000000123456',
        postalAccount: '',
        bothEmpty: false
      });
    });
  });

  describe('validateSingleAmount', () => {
    it('returns undefined if the beneficiary is new and wasSubmittedRef is false', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn(),
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(validateSingleAmount('100', mockContext)).toBeUndefined();
    });

    it('returns undefined if the value is valid', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn().mockReturnValue('Importo non valido')
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(validateSingleAmount('100', mockContext)).toBeUndefined();
    });

    it('returns an error message if the value is invalid', () => {
      const mockT = vi.fn().mockReturnValue('Importo non valido');
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: mockT
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      expect(validateSingleAmount('-10', mockContext)).toBe(
        'Importo non valido'
      );
      expect(validateSingleAmount('0', mockContext)).toBe('Importo non valido');
      expect(validateSingleAmount('abc', mockContext)).toBe(
        'Importo non valido'
      );
      expect(mockT).toHaveBeenCalledWith(
        'debtPositionCreateWizard.step3.beneficiary.amount.invalid'
      );
    });
  });

  describe('createBaseValidationRule', () => {
    it('runs validation only if wasSubmittedRef is true', () => {
      const mockWasSubmittedRef = { current: false };
      const mockValidator = vi.fn().mockReturnValue('Errore');

      const validationRule = createBaseValidationRule(
        mockWasSubmittedRef,
        mockValidator
      );

      expect(validationRule('test')).toBeUndefined();
      expect(mockValidator).not.toHaveBeenCalled();
    });

    it('returns the validator result when wasSubmittedRef is true', () => {
      const mockWasSubmittedRef = { current: true };
      const mockValidator = vi.fn().mockReturnValue('Errore');

      const validationRule = createBaseValidationRule(
        mockWasSubmittedRef,
        mockValidator
      );

      expect(validationRule('test')).toBe('Errore');
      expect(mockValidator).toHaveBeenCalledWith('test');
    });
  });

  describe('createPaymentMethodValidator', () => {
    it('returns undefined if either field is filled', () => {
      const getOtherFieldValue = vi.fn().mockReturnValue('valorizzato');
      const validator = vi.fn();

      const paymentMethodValidator = createPaymentMethodValidator(
        getOtherFieldValue,
        validator
      );

      expect(paymentMethodValidator('')).toBeUndefined();
      expect(validator).not.toHaveBeenCalled();
    });

    it('returns the validator result when both fields are empty', () => {
      const getOtherFieldValue = vi.fn().mockReturnValue('');
      const validator = vi.fn().mockReturnValue('Errore pagamento richiesto');

      const paymentMethodValidator = createPaymentMethodValidator(
        getOtherFieldValue,
        validator
      );

      expect(paymentMethodValidator('')).toBe('Errore pagamento richiesto');
      expect(validator).toHaveBeenCalledWith('', '');
    });
  });
});
