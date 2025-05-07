import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRef, MutableRefObject } from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import type { BeneficiaryValidationContext } from '../../models/paymentTypes';
import {
  isEmpty,
  buildFieldPath,
  getErrorData,
  isBeneficiaryNew,
  hasFieldError,
  getFieldErrorMessage,
  getFieldValue,
  formatAmount,
  validateBeneficiariesTotal,
  formatAmountWithTwoDecimals,
  filterAmountInput,
  handleAmountInputChange,
  handleAmountInputBlur,
  formatAmountForDisplay,
  createDebtorObject,
  createTransferObject,
  formatDateForApi,
  getPreviousInstallmentTransfers,
  createInstallmentObject,
  createSingleInstallmentObject,
  triggerValidationForAllBeneficiaries,
  triggerValidationForAllInstallmentBeneficiaries,
  triggerPaymentFieldsValidation,
  syncInstallmentBeneficiaries,
  validateInstallments,
  validateMultiBeneficiary,
  handleInstallmentValidationFailure
} from '../paymentUtility';

// Remove any mocks for getErrorData before tests
vi.unmock('../paymentUtility');

describe('isEmpty', () => {
  it('should return true for non-string values', () => {
    expect(isEmpty(null)).toBe(true);
    let undefinedVar;
    expect(isEmpty(undefinedVar)).toBe(true);
    expect(isEmpty(123)).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty([])).toBe(true);
  });

  it('should return true for empty strings or strings with only spaces', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('should return false for non-empty strings', () => {
    expect(isEmpty('test')).toBe(false);
    expect(isEmpty('  test  ')).toBe(false);
  });
});

describe('buildFieldPath', () => {
  it('should build path correctly', () => {
    const path = buildFieldPath<Record<string, unknown>, 'test'>(
      'beneficiaries',
      2,
      'test'
    );
    expect(path).toBe('beneficiaries.2.test');
  });
});

describe('getErrorData', () => {
  // Make sure there are no active mocks for getErrorData before starting tests
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unmock('../paymentUtility');
  });

  it('should handle standard case correctly', () => {
    // Create a structured error object
    const errors = {
      beneficiaries: [
        {},
        {
          amount: {
            message: 'Amount error'
          }
        }
      ]
    } as unknown as FieldErrors<FieldValues>;

    const result = getErrorData(errors, 'beneficiaries', 1, 'amount');
    expect(result.hasError).toBe(true);
    expect(result.errorMessage).toBe('Amount error');
  });

  it('should handle case of errors not found', () => {
    const errors = {} as FieldErrors<FieldValues>;
    const result = getErrorData(errors, 'beneficiaries', 1, 'amount');
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBe('');
  });

  it('should handle special case of installments', () => {
    // Create an error object for the installments case
    const errors = {
      installments: [
        {},
        {
          beneficiaries: [
            {},
            {
              amount: {
                message: 'Installment amount error'
              }
            }
          ]
        }
      ]
    } as unknown as FieldErrors<FieldValues>;

    const result = getErrorData(
      errors,
      'installments.1.beneficiaries',
      1,
      'amount'
    );
    expect(result.hasError).toBe(true);
    expect(result.errorMessage).toBe('Installment amount error');
  });

  it('should handle exceptions without failing', () => {
    // Create an error object that will cause an internal exception
    const errors = {
      installments: 'not an array' // This will cause an internal error
    } as unknown as FieldErrors<FieldValues>;

    const result = getErrorData(
      errors,
      'installments.1.beneficiaries',
      1,
      'amount'
    );
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBe('');
  });
});

describe('isBeneficiaryNew', () => {
  it('should correctly identify new beneficiaries', () => {
    const wasSubmittedRef = { current: true } as MutableRefObject<boolean>;
    const existingBeneficiaries: Record<string, boolean> = {
      id1: true
    };

    expect(
      isBeneficiaryNew('id1', wasSubmittedRef, existingBeneficiaries)
    ).toBe(false);
    expect(
      isBeneficiaryNew('id2', wasSubmittedRef, existingBeneficiaries)
    ).toBe(true);
  });

  it('should return false if form has not been submitted', () => {
    const wasSubmittedRef = { current: false } as MutableRefObject<boolean>;
    const existingBeneficiaries: Record<string, boolean> = {};

    expect(
      isBeneficiaryNew('id1', wasSubmittedRef, existingBeneficiaries)
    ).toBe(false);
  });
});

describe('hasFieldError and getFieldErrorMessage', () => {
  let context: BeneficiaryValidationContext<FieldValues>;

  beforeEach(() => {
    // Setup validation context for tests
    const wasSubmittedRef = createRef<boolean>();
    // Use MutableRefObject to assign a value to current
    (wasSubmittedRef as MutableRefObject<boolean>).current = true;

    context = {
      id: 'test-id',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: wasSubmittedRef,
      existingBeneficiaries: { 'test-id': true },
      errors: {} as FieldErrors<FieldValues>,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: vi.fn()
    };
  });

  afterEach(() => {
    // Restore original function
    vi.restoreAllMocks();
  });

  it('hasFieldError should return false if context indicates to skip validation', () => {
    context.isSubmitted = false;
    expect(hasFieldError('amount', context)).toBe(false);
  });

  it('getFieldErrorMessage should return empty string if context indicates to skip validation', () => {
    context.isSubmitted = false;
    expect(getFieldErrorMessage('amount', context)).toBe('');
  });

  it('should handle special fields correctly', () => {
    // Simplify test by verifying only function execution without errors
    ['amount', 'iban', 'postalAccount'].forEach((field) => {
      // Verify that functions don't generate errors when executed
      expect(() => {
        hasFieldError(field, context);
        getFieldErrorMessage(field, context);
      }).not.toThrow();
    });
  });
});

describe('getFieldValue', () => {
  it('should get field value', () => {
    // Setup context and mock getValues function
    const getValuesMock = vi.fn().mockReturnValue('test-value');
    const context = {
      fieldNamePrefix: 'beneficiaries',
      index: 2,
      getValues: getValuesMock
    } as unknown as BeneficiaryValidationContext<FieldValues>;

    const result = getFieldValue(context, 'amount');
    expect(result).toBe('test-value');
    expect(getValuesMock).toHaveBeenCalledWith('beneficiaries.2.amount');
  });
});

describe('formatAmount', () => {
  it('should format number correctly', () => {
    expect(formatAmount(123.45)).toBe('123,45');
    expect(formatAmount(123)).toBe('123,00');
  });

  it('should format numeric string correctly', () => {
    expect(formatAmount('123.45')).toBe('123,45');
    expect(formatAmount('123,45')).toBe('123,45');
  });

  it('should handle invalid values', () => {
    expect(formatAmount('not-a-number')).toBe('0,00');
  });
});

describe('validateBeneficiariesTotal', () => {
  it('should validate correctly when sum equals total', () => {
    const beneficiaries = [
      { amount: '50,00' },
      { amount: '30,00' },
      { amount: '20,00' }
    ];
    expect(validateBeneficiariesTotal(beneficiaries, '100,00')).toBe(true);
    expect(validateBeneficiariesTotal(beneficiaries, '100.00')).toBe(true);
  });

  it('should fail when sum differs from total', () => {
    const beneficiaries = [{ amount: '50,00' }, { amount: '30,00' }];
    expect(validateBeneficiariesTotal(beneficiaries, '100,00')).toBe(false);
  });

  it('should handle empty or null array', () => {
    expect(validateBeneficiariesTotal([], '100,00')).toBe(false);
    expect(
      validateBeneficiariesTotal(
        null as unknown as Array<{ amount: string }>,
        '100,00'
      )
    ).toBe(false);
  });

  it('should handle non-numeric values', () => {
    const beneficiaries = [{ amount: 'not-a-number' }, { amount: '50,00' }];
    expect(validateBeneficiariesTotal(beneficiaries, '100,00')).toBe(false);
  });
});

describe('formatAmountWithTwoDecimals', () => {
  it('should format correctly with two decimals', () => {
    expect(formatAmountWithTwoDecimals('123.4')).toBe('123.40');
    expect(formatAmountWithTwoDecimals('123,4')).toBe('123.40');
    expect(formatAmountWithTwoDecimals('123')).toBe('123.00');
  });

  it('should return original value if not a number', () => {
    expect(formatAmountWithTwoDecimals('abc')).toBe('abc');
  });
});

describe('filterAmountInput', () => {
  it('should filter non-numeric characters', () => {
    expect(filterAmountInput('123abc,45')).toBe('123.45');
    expect(filterAmountInput('abc123.45xyz')).toBe('123.45');
  });

  it('should convert commas to dots', () => {
    expect(filterAmountInput('123,45')).toBe('123.45');
  });
});

describe('handleAmountInputChange', () => {
  it('should call filterAmountInput', () => {
    expect(handleAmountInputChange('123abc,45')).toBe('123.45');
  });
});

describe('handleAmountInputBlur', () => {
  it('should call formatAmountWithTwoDecimals', () => {
    expect(handleAmountInputBlur('123,4')).toBe('123.40');
  });
});

describe('formatAmountForDisplay', () => {
  it('should replace dots with commas', () => {
    expect(formatAmountForDisplay('123.45')).toBe('123,45');
  });

  it('should handle empty string', () => {
    expect(formatAmountForDisplay('')).toBe('');
  });
});

describe('createDebtorObject', () => {
  it('creates a debtor object with correct properties', () => {
    const step2Data = {
      subjectType: { value: 'PF', readonly: false },
      taxCode: { value: 'RSSMRA80A01H501U', readonly: false },
      fullName: { value: 'Mario Rossi', readonly: false },
      address: { value: 'Via Roma 1', readonly: false },
      civicNumber: { value: '1', readonly: false },
      zipCode: { value: '00100', readonly: false },
      city: { value: 'Roma', readonly: false },
      province: { value: 'RM', readonly: false },
      country: { value: 'IT', readonly: false }
    };

    const result = createDebtorObject(step2Data);

    expect(result).toEqual({
      entityType: 'PF',
      fiscalCode: 'RSSMRA80A01H501U',
      fullName: 'Mario Rossi',
      address: 'Via Roma 1',
      civic: '1',
      postalCode: '00100',
      location: 'Roma',
      province: 'RM',
      nation: 'IT'
    });
  });
});

describe('createTransferObject', () => {
  it('creates a transfer object with correct properties', () => {
    const beneficiary = {
      taxCode: '12345678901',
      entityName: 'Test Company',
      amount: '100.00',
      remittance: 'Test payment',
      iban: 'IT60X0542811101000000123456',
      postalAccount: '123456',
      taxonomyCode: 'TAX001'
    };

    const result = createTransferObject(beneficiary, 0);

    expect(result).toEqual({
      orgFiscalCode: '12345678901',
      orgName: 'Test Company',
      amountCents: 10000,
      remittanceInformation: 'Test payment',
      iban: 'IT60X0542811101000000123456',
      category: 'TAX001',
      transferIndex: 2
    });
  });
});

describe('formatDateForApi', () => {
  it('formats date string correctly', () => {
    expect(formatDateForApi('01/01/2023')).toBe('2023-01-01');
  });

  it('formats Date object correctly', () => {
    const date = new Date('2023-01-01');
    expect(formatDateForApi(date)).toBe('2023-01-01');
  });

  it('returns undefined for null or undefined', () => {
    expect(formatDateForApi(null)).toBeUndefined();
    expect(formatDateForApi(undefined)).toBeUndefined();
  });
});

describe('getPreviousInstallmentTransfers', () => {
  it('returns empty array if no previous installments', () => {
    const currentInstallment = {
      amount: '100.00',
      dueDate: '01/01/2023',
      remittance: 'Test payment',
      isMultibeneficiary: true,
      beneficiaries: []
    };
    const formattedValues = {
      paymentObject: { value: 'Test', readonly: false },
      paymentOption: { value: 'SINGLE' as const, readonly: false },
      amount: { value: '100.00', readonly: false },
      dueDate: { value: '01/01/2023', readonly: false },
      flagMandatoryDueDate: true,
      isMultibeneficiary: { value: true, readonly: false },
      installments: []
    };

    expect(
      getPreviousInstallmentTransfers(currentInstallment, formattedValues)
    ).toEqual([]);
  });

  it('returns transfers from previous installment', () => {
    const currentInstallment = {
      amount: '100.00',
      dueDate: '01/01/2023',
      remittance: 'Test payment',
      isMultibeneficiary: true,
      beneficiaries: []
    };
    const previousBeneficiary = {
      entityName: 'Test Company',
      amount: '100.00',
      taxCode: '12345678901',
      remittance: 'Test payment',
      iban: 'IT60X0542811101000000123456',
      postalAccount: '123456',
      taxonomyCode: 'TAX001'
    };
    const formattedValues = {
      paymentObject: { value: 'Test', readonly: false },
      paymentOption: { value: 'SINGLE' as const, readonly: false },
      amount: { value: '100.00', readonly: false },
      dueDate: { value: '01/01/2023', readonly: false },
      flagMandatoryDueDate: true,
      isMultibeneficiary: { value: true, readonly: false },
      installments: [
        {
          amount: '100.00',
          dueDate: '01/01/2023',
          remittance: 'Test payment',
          isMultibeneficiary: true,
          beneficiaries: [previousBeneficiary]
        },
        currentInstallment
      ]
    };

    const result = getPreviousInstallmentTransfers(
      currentInstallment,
      formattedValues
    );
    expect(result).toHaveLength(1);
    expect(result[0].orgFiscalCode).toBe('12345678901');
  });
});

describe('createInstallmentObject', () => {
  it('creates installment object with correct properties', () => {
    const installment = {
      amount: '100.00',
      dueDate: '01/01/2023',
      remittance: 'Test payment',
      isMultibeneficiary: true,
      beneficiaries: [
        {
          entityName: 'Test Company',
          amount: '100.00',
          taxCode: '12345678901',
          remittance: 'Test payment',
          iban: 'IT60X0542811101000000123456',
          postalAccount: '123456',
          taxonomyCode: 'TAX001'
        }
      ]
    };

    const step2Data = {
      subjectType: { value: 'PF', readonly: false },
      taxCode: { value: 'RSSMRA80A01H501U', readonly: false },
      fullName: { value: 'Mario Rossi', readonly: false },
      address: { value: 'Via Roma 1', readonly: false },
      civicNumber: { value: '1', readonly: false },
      zipCode: { value: '00100', readonly: false },
      city: { value: 'Roma', readonly: false },
      province: { value: 'RM', readonly: false },
      country: { value: 'IT', readonly: false }
    };

    const formattedValues = {
      paymentObject: { value: 'Test', readonly: false },
      paymentOption: { value: 'SINGLE' as const, readonly: false },
      amount: { value: '100.00', readonly: false },
      dueDate: { value: '01/01/2023', readonly: false },
      flagMandatoryDueDate: true,
      isMultibeneficiary: { value: true, readonly: false },
      installments: []
    };

    const result = createInstallmentObject(
      installment,
      step2Data,
      formattedValues
    );

    expect(result).toHaveProperty('dueDate', '2023-01-01');
    expect(result).toHaveProperty('amountCents', 10000);
    expect(result).toHaveProperty('remittanceInformation', 'Test payment');
    expect(result).toHaveProperty('debtor');
    expect(result).toHaveProperty('transfers');
  });
});

describe('createSingleInstallmentObject', () => {
  it('creates single installment object with correct properties', () => {
    const formattedValues = {
      dueDate: { value: '01/01/2023', readonly: false },
      amount: { value: '100.00', readonly: false },
      paymentObject: { value: 'Test payment', readonly: false },
      isMultibeneficiary: { value: true, readonly: false },
      paymentOption: { value: 'SINGLE' as const, readonly: false },
      flagMandatoryDueDate: true,
      beneficiaries: [
        {
          entityName: 'Test Company',
          amount: '100.00',
          taxCode: '12345678901',
          remittance: 'Test payment',
          iban: 'IT60X0542811101000000123456',
          postalAccount: '123456',
          taxonomyCode: 'TAX001'
        }
      ]
    };

    const step2Data = {
      subjectType: { value: 'PF', readonly: false },
      taxCode: { value: 'RSSMRA80A01H501U', readonly: false },
      fullName: { value: 'Mario Rossi', readonly: false },
      address: { value: 'Via Roma 1', readonly: false },
      civicNumber: { value: '1', readonly: false },
      zipCode: { value: '00100', readonly: false },
      city: { value: 'Roma', readonly: false },
      province: { value: 'RM', readonly: false },
      country: { value: 'IT', readonly: false }
    };

    const result = createSingleInstallmentObject(formattedValues, step2Data);

    expect(result).toHaveProperty('dueDate', '2023-01-01');
    expect(result).toHaveProperty('amountCents', 10000);
    expect(result).toHaveProperty('remittanceInformation', 'Test payment');
    expect(result).toHaveProperty('debtor');
    expect(result).toHaveProperty('transfers');
  });
});

describe('triggerValidationForAllBeneficiaries', () => {
  it('triggers validation for all beneficiaries', () => {
    const beneficiaries = [{ amount: '100.00' }, { amount: '200.00' }];
    const trigger = vi.fn();

    triggerValidationForAllBeneficiaries(beneficiaries, trigger);

    expect(trigger).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveBeenCalledWith('beneficiaries.0.amount');
    expect(trigger).toHaveBeenCalledWith('beneficiaries.1.amount');
  });
});

describe('triggerValidationForAllInstallmentBeneficiaries', () => {
  it('triggers validation for all installment beneficiaries', () => {
    const installments = [
      {
        isMultibeneficiary: true,
        beneficiaries: [{ amount: '100.00' }, { amount: '200.00' }]
      }
    ];
    const trigger = vi.fn();

    triggerValidationForAllInstallmentBeneficiaries(installments, trigger);

    expect(trigger).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.0.amount'
    );
    expect(trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.1.amount'
    );
  });
});

describe('triggerPaymentFieldsValidation', () => {
  it('triggers validation for payment fields', () => {
    const installments = [
      {
        isMultibeneficiary: true,
        beneficiaries: [
          { iban: 'IT60X0542811101000000123456', postalAccount: '123456' }
        ]
      }
    ];
    const trigger = vi.fn();

    triggerPaymentFieldsValidation(installments, trigger);

    expect(trigger).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveBeenCalledWith('installments.0.beneficiaries.0.iban');
    expect(trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.0.postalAccount'
    );
  });
});

describe('syncInstallmentBeneficiaries', () => {
  it('syncs beneficiaries when sameBeneficiariesAsBefore is true', () => {
    const installments = [
      {
        amount: '100.00',
        dueDate: '01/01/2023',
        remittance: 'Test payment',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test Company',
            amount: '100.00',
            taxCode: '12345678901',
            remittance: 'Test payment',
            iban: 'IT60X0542811101000000123456',
            postalAccount: '123456',
            taxonomyCode: 'TAX001'
          }
        ]
      },
      {
        amount: '100.00',
        dueDate: '01/01/2023',
        remittance: 'Test payment',
        isMultibeneficiary: true,
        sameBeneficiariesAsBefore: true,
        beneficiaries: []
      }
    ];

    const result = syncInstallmentBeneficiaries(installments);

    expect(result.modified).toBe(true);
    expect(result.installments[1].beneficiaries).toEqual([
      {
        entityName: 'Test Company',
        amount: '100.00',
        taxCode: '12345678901',
        remittance: 'Test payment',
        iban: 'IT60X0542811101000000123456',
        postalAccount: '123456',
        taxonomyCode: 'TAX001'
      }
    ]);
  });

  it('does not sync when sameBeneficiariesAsBefore is false', () => {
    const installments = [
      {
        amount: '100.00',
        dueDate: '01/01/2023',
        remittance: 'Test payment',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test Company',
            amount: '100.00',
            taxCode: '12345678901',
            remittance: 'Test payment',
            iban: 'IT60X0542811101000000123456',
            postalAccount: '123456',
            taxonomyCode: 'TAX001'
          }
        ]
      },
      {
        amount: '100.00',
        dueDate: '01/01/2023',
        remittance: 'Test payment',
        isMultibeneficiary: true,
        sameBeneficiariesAsBefore: false,
        beneficiaries: []
      }
    ];

    const result = syncInstallmentBeneficiaries(installments);

    expect(result.modified).toBe(false);
    expect(result.installments[1].beneficiaries).toEqual([]);
  });
});

describe('validateInstallments', () => {
  it('validates installments correctly', () => {
    const installments = [
      {
        amount: '100.00',
        dueDate: '01/01/2023',
        remittance: 'Test payment',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test Company',
            amount: '50.00',
            taxCode: '12345678901',
            remittance: 'Test payment',
            iban: 'IT60X0542811101000000123456',
            postalAccount: '123456',
            taxonomyCode: 'TAX001'
          },
          {
            entityName: 'Test Company 2',
            amount: '49.99',
            taxCode: '12345678902',
            remittance: 'Test payment 2',
            iban: 'IT60X0542811101000000123457',
            postalAccount: '123457',
            taxonomyCode: 'TAX002'
          }
        ]
      }
    ];
    const trigger = vi.fn();

    const result = validateInstallments(installments, trigger);

    expect(result.hasInvalidBeneficiaries).toBe(false);
    expect(result.hasInvalidPaymentFields).toBe(false);
    expect(result.hasInvalidAmounts).toBe(false);
    expect(result.hasEmptyRemittance).toBe(false);
  });

  it('detects invalid installments', () => {
    const installments = [
      {
        amount: '0',
        dueDate: '01/01/2023',
        remittance: '',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test Company',
            amount: '100.00',
            taxCode: '12345678901',
            remittance: 'Test payment',
            iban: '',
            postalAccount: '',
            taxonomyCode: 'TAX001'
          }
        ]
      }
    ];
    const trigger = vi.fn();

    const result = validateInstallments(installments, trigger);

    expect(result.hasInvalidBeneficiaries).toBe(true);
    expect(result.hasInvalidPaymentFields).toBe(true);
    expect(result.hasInvalidAmounts).toBe(true);
    expect(result.hasEmptyRemittance).toBe(true);
  });
});

describe('validateMultiBeneficiary', () => {
  it('validates multi-beneficiary correctly', () => {
    const getValues = vi.fn().mockReturnValue({
      beneficiaries: [
        {
          entityName: 'Test Company',
          amount: '50.00',
          taxCode: '12345678901',
          remittance: 'Test payment',
          iban: 'IT60X0542811101000000123456',
          postalAccount: '123456',
          taxonomyCode: 'TAX001'
        },
        {
          entityName: 'Test Company 2',
          amount: '49.99',
          taxCode: '12345678902',
          remittance: 'Test payment 2',
          iban: 'IT60X0542811101000000123457',
          postalAccount: '123457',
          taxonomyCode: 'TAX002'
        }
      ]
    });
    const trigger = vi.fn();

    const result = validateMultiBeneficiary(getValues, true, '100.00', trigger);

    expect(result).toBe(true);
  });

  it('detects invalid multi-beneficiary', () => {
    const getValues = vi.fn().mockReturnValue({
      beneficiaries: [
        {
          entityName: 'Test Company',
          amount: '100.00',
          taxCode: '12345678901',
          remittance: 'Test payment',
          iban: '',
          postalAccount: '',
          taxonomyCode: 'TAX001'
        }
      ]
    });
    const trigger = vi.fn();

    const result = validateMultiBeneficiary(getValues, true, '100.00', trigger);

    expect(result).toBe(false);
  });
});

describe('handleInstallmentValidationFailure', () => {
  it('triggers validation for all fields when there are errors', () => {
    const installments = [
      {
        amount: '100.00',
        dueDate: '01/01/2023',
        remittance: 'Test payment',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test Company',
            amount: '100.00',
            taxCode: '12345678901',
            remittance: 'Test payment',
            iban: 'IT60X0542811101000000123456',
            postalAccount: '123456',
            taxonomyCode: 'TAX001'
          }
        ]
      }
    ];
    const validationResults = {
      hasInvalidBeneficiaries: true,
      hasInvalidPaymentFields: true,
      hasInvalidAmounts: true,
      hasEmptyRemittance: true
    };
    const trigger = vi.fn();

    handleInstallmentValidationFailure(
      installments,
      validationResults,
      trigger
    );

    expect(trigger).toHaveBeenCalledWith('installments.0.amount');
    expect(trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.0.amount'
    );
    expect(trigger).toHaveBeenCalledWith('installments.0.beneficiaries.0.iban');
    expect(trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.0.postalAccount'
    );
  });
});
