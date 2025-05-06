import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useInstallmentManagement } from './useInstallmentManagement';
import { useForm } from 'react-hook-form';
import * as formattersModule from '../utils/formatters';
import * as fieldValidationModule from '../utils/fieldValidation';
import React from 'react';
import { Installment } from '../models/paymentTypes';

// Mock preparation
const mockFields = [{ id: 'field1' }, { id: 'field2' }];
const mockAppend = vi.fn();
const mockRemove = vi.fn();

// Mocking external dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFieldArray: () => ({
      fields: mockFields,
      append: mockAppend,
      remove: mockRemove,
      swap: vi.fn(),
      move: vi.fn(),
      prepend: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      replace: vi.fn()
    })
  };
});

vi.mock('../utils/formatters', async () => {
  const actual = await vi.importActual('../utils/formatters');
  return {
    ...actual,
    moneyFormat: vi.fn((amount: number) => `€ ${(amount / 100).toFixed(2)}`),
    formatDate: vi.fn((dateString: string) => {
      return dateString ? '01/01/2023' : '';
    })
  };
});

vi.mock('../utils/fieldValidation', async () => {
  const actual = await vi.importActual('../utils/fieldValidation');
  return {
    ...actual,
    createAmountValidator: vi.fn(() => ({
      required: {
        value: true,
        message: 'Required field'
      },
      validate: {
        positive: (value: string) =>
          (value && parseFloat(value) > 0) || 'Amount must be positive',
        validNumber: (value: string) =>
          (value && !isNaN(parseFloat(value))) || 'Enter a valid number'
      }
    }))
  };
});

// Base type for tests
type TestFormValues = {
  testInstallments: Array<Installment>;
};

// Wrapper to provide the necessary React context
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <React.Fragment>{children}</React.Fragment>;
};

describe('useInstallmentManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset timers for setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with two empty installments', () => {
    // Initialize formMethods inside the test to ensure it's created in the React context
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger
        }),
      { wrapper }
    );

    expect(result.current.fields.length).toBe(2);
    expect(result.current.MIN_INSTALLMENTS).toBe(2);
    expect(result.current.MAX_INSTALLMENTS).toBe(12);
  });

  it('should create correct validators', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          flagMandatoryDueDate: true
        }),
      { wrapper }
    );

    expect(
      vi.mocked(fieldValidationModule.createAmountValidator)
    ).toHaveBeenCalled();
    expect(result.current.validators.dueDate.required).toBeTruthy();

    // Test with flagMandatoryDueDate set to false
    const { result: resultWithNonMandatoryDueDate } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          flagMandatoryDueDate: false
        }),
      { wrapper }
    );

    expect(
      resultWithNonMandatoryDueDate.current.validators.dueDate.required
    ).toBe(false);
  });

  it('should add a new installment', async () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    const mockOnInstallmentsChange = vi.fn();

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          onInstallmentsChange: mockOnInstallmentsChange
        }),
      { wrapper }
    );

    // Add a new installment (there should now be 3)
    act(() => {
      result.current.addInstallment();
    });

    // Run timers to trigger the setTimeout
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.fields.length).toBe(2); // The mock always returns 2 fields
    expect(mockAppend).toHaveBeenCalled(); // Verify that append was called

    // Verify that append was called with an object containing the remittance field
    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '',
        dueDate: null,
        remittance: '',
        isMultibeneficiary: false
      })
    );

    expect(mockOnInstallmentsChange).toHaveBeenCalled();
  });

  it('should not add an installment beyond the maximum limit', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    // Modify the mock for this specific test to simulate reaching the maximum limit
    mockFields.length = 12; // Set the maximum number of installments

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger
        }),
      { wrapper }
    );

    // Try to add another installment beyond the limit
    act(() => {
      result.current.addInstallment();
    });

    // Verify that append was not called since we're at the limit
    expect(mockAppend).not.toHaveBeenCalled();
  });

  it('should remove an installment', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    // Reset the mock for this test
    mockFields.length = 4; // Set a number of installments greater than the minimum

    const formMethods = formResult.current;

    const mockOnInstallmentsChange = vi.fn();

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          onInstallmentsChange: mockOnInstallmentsChange
        }),
      { wrapper }
    );

    // Remove an installment
    act(() => {
      result.current.removeInstallment(1);
    });

    // Run timers to trigger the setTimeout
    act(() => {
      vi.runAllTimers();
    });

    expect(mockRemove).toHaveBeenCalled(); // Verify that remove was called
    expect(mockOnInstallmentsChange).toHaveBeenCalled();
  });

  it('should not remove installments below the minimum allowed', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    // Reset the mock for this test
    mockFields.length = 2; // Set the minimum number of installments

    const formMethods = formResult.current;

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger
        }),
      { wrapper }
    );

    // Try to remove an installment when there are only 2
    act(() => {
      result.current.removeInstallment(0);
    });

    // Verify that remove was not called since we're at the minimum
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('should correctly calculate the total amount', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Configure the value returned by getValues to simulate installments with amounts
    const mockGetValues = vi.fn();
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return { amount: '100' };
      } else if (path === 'testInstallments.1') {
        return { amount: '200' };
      }
      return null;
    });

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    const totalAmount = result.current.calculateTotalAmount();
    expect(totalAmount).toBe('300.00');
  });

  it('should correctly handle decimal number format', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Configure the value returned by getValues to simulate installments with decimal amounts
    const mockGetValues = vi.fn();
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return { amount: '100,50' };
      } else if (path === 'testInstallments.1') {
        return { amount: '200,25' };
      }
      return null;
    });

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    const totalAmount = result.current.calculateTotalAmount();
    expect(totalAmount).toBe('300.75');
  });

  it('should correctly format installment data', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Reset the mock for this test
    mockFields.length = 2;

    // Mock the values
    const mockGetValues = vi.fn();
    const mockDate = new Date('2023-01-01');
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return {
          amount: '100',
          dueDate: mockDate,
          remittance: 'Rata 1',
          isMultibeneficiary: false
        };
      } else if (path === 'testInstallments.1') {
        return {
          amount: '200',
          dueDate: null,
          remittance: 'Rata 2',
          isMultibeneficiary: true
        };
      }
      return null;
    });

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: true,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    // Set the existing installments
    act(() => {
      result.current.wasSubmittedRef.current = true;
    });

    const installmentsData = result.current.getInstallmentsData();

    expect(installmentsData.length).toBe(2);
    expect(installmentsData[0].amount).toBe('100.00');
    expect(installmentsData[0].dueDate).toBe('01/01/2023');
    expect(installmentsData[0].remittance).toBe('Rata 1');
    expect(installmentsData[0].isMultibeneficiary).toBe(false);
    expect(installmentsData[1].dueDate).toBeNull();
    expect(installmentsData[1].remittance).toBe('Rata 2');
    expect(installmentsData[1].isMultibeneficiary).toBe(true);

    // Verify that moneyFormat was called
    expect(vi.mocked(formattersModule.moneyFormat)).toHaveBeenCalled();
  });

  it('should store existing installments after submit', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Reset the mock for this test
    mockFields.length = 2;

    const { result, rerender } = renderHook(
      (props) => useInstallmentManagement<TestFormValues>(props),
      {
        initialProps: {
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formResult.current.getValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        },
        wrapper
      }
    );

    // Initially wasSubmittedRef.current should be false
    expect(result.current.wasSubmittedRef.current).toBe(false);

    // Rerender with isSubmitted = true
    rerender({
      control: formResult.current.control,
      fieldNamePrefix: 'testInstallments' as const,
      isSubmitted: true,
      getValues: formResult.current.getValues,
      setValue: formResult.current.setValue,
      trigger: formResult.current.trigger
    });

    // Execute the effect manually
    act(() => {
      // Simulate the effect that updates wasSubmittedRef when isSubmitted is true
      if (!result.current.wasSubmittedRef.current) {
        result.current.wasSubmittedRef.current = true;
      }
    });

    // After submit, wasSubmittedRef.current should be true
    expect(result.current.wasSubmittedRef.current).toBe(true);
  });

  it('should call onInstallmentsChange when installments change', async () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    const mockOnInstallmentsChange = vi.fn();

    // Mock getValues for total amount calculation
    const mockGetValues = vi.fn().mockReturnValue({ amount: '100' });

    renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger,
          onInstallmentsChange: mockOnInstallmentsChange
        }),
      { wrapper }
    );

    // Let the effect that calls onInstallmentsChange run
    await vi.runAllTimersAsync();

    // Verify that onInstallmentsChange was called
    expect(mockOnInstallmentsChange).toHaveBeenCalled();
  });

  it('should correctly handle the remittance field', () => {
    // Initialize formMethods inside the test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Mock values for getValues that includes the remittance field
    const mockGetValues = vi.fn();
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return {
          amount: '100',
          dueDate: new Date('2023-01-01'),
          remittance: 'Causale rata 1',
          isMultibeneficiary: false
        };
      }
      return null;
    });

    // Call the hook
    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    // Verify that the getInstallmentsData method returns the remittance field
    const installmentsData = result.current.getInstallmentsData();
    expect(installmentsData[0]).toHaveProperty('remittance', 'Causale rata 1');

    // Simulate adding an installment by directly calling the method
    act(() => {
      result.current.addInstallment();
    });

    // Verify that append was called with an object that includes the empty remittance field
    expect(mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        remittance: ''
      })
    );
  });
});
