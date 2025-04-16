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
  createPaymentMethodValidator,
  ValidationContext
} from '../beneficiaryValidation';

describe('beneficiaryValidation', () => {
  describe('isEmpty', () => {
    it('restituisce true per valori vuoti', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty()).toBe(true);
      expect(isEmpty(null)).toBe(true);
    });

    it('restituisce false per valori non vuoti', () => {
      expect(isEmpty('test')).toBe(false);
      expect(isEmpty('0')).toBe(false);
      expect(isEmpty(' test ')).toBe(false);
    });

    it('restituisce true per valori non stringa', () => {
      expect(isEmpty(0)).toBe(true);
      expect(isEmpty(123)).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty([])).toBe(true);
    });
  });

  describe('getErrorData', () => {
    it('restituisce dati di errore corretti', () => {
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

    it('gestisce correttamente gli errori mancanti', () => {
      const mockErrors = {} as FieldErrors<Record<string, unknown>>;

      const result = getErrorData(mockErrors, 'beneficiaries', 0, 'entityName');
      expect(result).toEqual({
        hasError: false,
        errorMessage: ''
      });
    });

    it('gestisce correttamente un errore senza messaggio', () => {
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
    it('restituisce true se il beneficiario è nuovo', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        isBeneficiaryNew('id-2', mockWasSubmittedRef, mockExistingBeneficiaries)
      ).toBe(true);
    });

    it('restituisce false se il beneficiario esiste già', () => {
      const mockWasSubmittedRef = { current: true };
      const mockExistingBeneficiaries = { 'id-1': true };

      expect(
        isBeneficiaryNew('id-1', mockWasSubmittedRef, mockExistingBeneficiaries)
      ).toBe(false);
    });

    it('restituisce false se wasSubmittedRef è false', () => {
      const mockWasSubmittedRef = { current: false };
      const mockExistingBeneficiaries = {};

      expect(
        isBeneficiaryNew('id-1', mockWasSubmittedRef, mockExistingBeneficiaries)
      ).toBe(false);
    });
  });

  describe('isRecentlyCreated', () => {
    it('restituisce true se wasSubmittedRef è false', () => {
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

    it('restituisce true se il beneficiario non è tra quelli esistenti', () => {
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

    it('restituisce false se il beneficiario è tra quelli esistenti e wasSubmittedRef è true', () => {
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
    it('restituisce true se isSubmitted è true e il beneficiario esiste', () => {
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

    it('restituisce false se isSubmitted è false', () => {
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

    it('restituisce false se il beneficiario è nuovo e wasSubmittedRef è false', () => {
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
    it('restituisce true se non si devono mostrare errori di validazione', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(shouldSkipValidation(mockContext)).toBe(true);
    });

    it('restituisce false se si devono mostrare errori di validazione', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(shouldSkipValidation(mockContext)).toBe(false);
    });
  });

  describe('buildFieldPath', () => {
    it('costruisce correttamente il path del campo', () => {
      expect(buildFieldPath('beneficiaries', 0, 'entityName')).toBe(
        'beneficiaries.0.entityName'
      );
      expect(buildFieldPath('items', 3, 'price')).toBe('items.3.price');
    });
  });

  describe('hasFieldError', () => {
    it('restituisce false se shouldSkipValidation è true', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(hasFieldError('entityName', mockContext)).toBe(false);
    });

    it('restituisce true se il campo ha un errore', () => {
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
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(hasFieldError('entityName', mockContext)).toBe(true);
    });

    it('restituisce false se il campo non ha errori', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: { 'id-1': true },
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(hasFieldError('entityName', mockContext)).toBe(false);
    });
  });

  describe('getFieldErrorMessage', () => {
    it('restituisce stringa vuota se shouldSkipValidation è true', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(getFieldErrorMessage('entityName', mockContext)).toBe('');
    });

    it('restituisce il messaggio di errore per un campo con errore', () => {
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
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(getFieldErrorMessage('entityName', mockContext)).toBe(
        'Campo obbligatorio'
      );
    });

    it('restituisce stringa vuota se isSubmitted è false', () => {
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
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(getFieldErrorMessage('entityName', mockContext)).toBe('');
    });
  });

  describe('getFieldValue', () => {
    it('recupera il valore di un campo dal contesto', () => {
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
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = getFieldValue(mockContext, 'entityName');

      expect(mockGetValues).toHaveBeenCalledWith('beneficiaries.0.entityName');
      expect(result).toBe('Test Entity');
    });
  });

  describe('checkPaymentFields', () => {
    it('restituisce i valori dei campi di pagamento e lo stato bothEmpty=true se entrambi vuoti', () => {
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
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = checkPaymentFields(mockContext);

      expect(result).toEqual({
        iban: '',
        postalAccount: '',
        bothEmpty: true
      });
    });

    it('restituisce i valori dei campi di pagamento e lo stato bothEmpty=false se almeno uno è valorizzato', () => {
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
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = checkPaymentFields(mockContext);

      expect(result).toEqual({
        iban: 'IT60X0542811101000000123456',
        postalAccount: '',
        bothEmpty: false
      });
    });
  });

  describe('validateSingleAmount', () => {
    it('restituisce undefined se il beneficiario è nuovo e wasSubmittedRef è false', () => {
      const mockContext = {
        id: 'id-1',
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        index: 0,
        getValues: vi.fn(),
        t: vi.fn()
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(validateSingleAmount('100', mockContext)).toBeUndefined();
    });

    it('restituisce undefined se il valore è valido', () => {
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
      } as unknown as ValidationContext<Record<string, unknown>>;

      expect(validateSingleAmount('100', mockContext)).toBeUndefined();
    });

    it('restituisce un messaggio di errore se il valore non è valido', () => {
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
      } as unknown as ValidationContext<Record<string, unknown>>;

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
    it('esegue la validazione solo se wasSubmittedRef è true', () => {
      const mockWasSubmittedRef = { current: false };
      const mockValidator = vi.fn().mockReturnValue('Errore');

      const validationRule = createBaseValidationRule(
        mockWasSubmittedRef,
        mockValidator
      );

      expect(validationRule('test')).toBeUndefined();
      expect(mockValidator).not.toHaveBeenCalled();
    });

    it('restituisce il risultato del validator quando wasSubmittedRef è true', () => {
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
    it('restituisce undefined se uno dei due campi è valorizzato', () => {
      const getOtherFieldValue = vi.fn().mockReturnValue('valorizzato');
      const validator = vi.fn();

      const paymentMethodValidator = createPaymentMethodValidator(
        getOtherFieldValue,
        validator
      );

      expect(paymentMethodValidator('')).toBeUndefined();
      expect(validator).not.toHaveBeenCalled();
    });

    it('restituisce il risultato del validator quando entrambi i campi sono vuoti', () => {
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
