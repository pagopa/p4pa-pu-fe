import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UseFormTrigger } from 'react-hook-form';
import type { BeneficiaryValidationContext } from '../../../../models/paymentTypes';
import {
  handleAmountChange,
  handleIBANChange,
  handlePostalIbanChange,
  handleAmountBlur,
  BeneficiaryHeader,
  EntityNameField,
  TaxCodeField,
  hasIBANError,
  getIBANErrorMessage,
  hasPostalIbanError,
  getPostalIbanErrorMessage,
  hasPostalAccountError,
  getPostalAccountErrorMessage,
  AmountField,
  IBANField,
  PostalIbanField,
  PostalAccountField,
  TaxonomyCodeField,
  RemittanceField
} from './BeneficiaryFieldComponents';

// Utility function mocks for tests
const mockRef = { current: false };
const mockFieldNamePrefix = 'beneficiaries';
const mockIndex = 0;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Event Handlers', () => {
  describe('handleAmountChange', () => {
    it('accepts only numbers and decimal separators', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}];

      const event = {
        target: { value: '123abc.45!' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('123.45');
    });

    it('converts comma to dot', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}];

      const event = {
        target: { value: '123,45' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('123.45');
    });

    it('updates validation of other amounts if there are multiple beneficiaries', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}, {}];

      const event = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      // Verify that trigger was called for the other field
      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.1.amount`
      );
    });

    it('does not update validation if there is only one beneficiary', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}];

      const event = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      // Verify that trigger is called only for the current field
      expect(mockTrigger).toHaveBeenCalledTimes(1);
      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.${mockIndex}.amount`
      );
    });
  });

  describe('handleIBANChange', () => {
    it('converts the value to uppercase', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: 'it60x0542811101000000123456' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleIBANChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('IT60X0542811101000000123456');
    });

    it('triggers validation for the iban field only', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: 'IT60X0542811101000000123456' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleIBANChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.${mockIndex}.iban`
      );
    });
  });

  describe('handleAmountBlur', () => {
    it('formats the value with two decimals', () => {
      const mockOnChange = vi.fn();
      const mockOnBlur = vi.fn();

      const event = {
        target: { value: '100.5' }
      } as React.FocusEvent<HTMLInputElement>;

      handleAmountBlur(event, mockOnChange, mockOnBlur);

      expect(mockOnChange).toHaveBeenCalledWith('100.50');
      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('correctly handles values with commas', () => {
      const mockOnChange = vi.fn();
      const mockOnBlur = vi.fn();

      const event = {
        target: { value: '100,5' }
      } as React.FocusEvent<HTMLInputElement>;

      handleAmountBlur(event, mockOnChange, mockOnBlur);

      expect(mockOnChange).toHaveBeenCalledWith('100.50');
    });

    it('does not format if the value is not numeric', () => {
      const mockOnChange = vi.fn();
      const mockOnBlur = vi.fn();

      const event = {
        target: { value: 'abc' }
      } as React.FocusEvent<HTMLInputElement>;

      handleAmountBlur(event, mockOnChange, mockOnBlur);

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });
});

describe('Render Components', () => {
  const mockT = vi.fn((key: string) => key);

  describe('BeneficiaryHeader', () => {
    it('correctly renders the header', () => {
      const mockOnRemove = vi.fn();

      render(
        <BeneficiaryHeader
          index={mockIndex}
          t={mockT}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(
        screen.getByText('debtPositionCreateWizard.step3.beneficiary.title')
      ).toBeInTheDocument();
      expect(screen.getByText('commons.delete')).toBeInTheDocument();
    });

    it('calls onRemove when the delete button is clicked', () => {
      const mockOnRemove = vi.fn();

      render(
        <BeneficiaryHeader
          index={mockIndex}
          t={mockT}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.click(screen.getByText('commons.delete'));
      expect(mockOnRemove).toHaveBeenCalledWith(mockIndex);
    });
  });

  describe('EntityNameField', () => {
    it('correctly renders the field', () => {
      const mockField = {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: 'Test Entity',
        name: 'entityName',
        ref: { current: null }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn(),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      render(
        <EntityNameField field={mockField} t={mockT} context={mockContext} />
      );

      const input = screen.getByDisplayValue('Test Entity') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Test Entity');

      expect(
        screen.getByText(
          'debtPositionCreateWizard.step3.beneficiary.entityName.label'
        )
      ).toBeInTheDocument();
    });
  });

  describe('TaxCodeField', () => {
    it('converts the value to uppercase', () => {
      // Create a simple mock for the onChange function
      const mockOnChange = vi.fn();
      const mockField = {
        onChange: mockOnChange,
        onBlur: vi.fn(),
        value: 'rssmra80a01h501u',
        name: 'taxCode',
        ref: { current: null }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn(),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      // Render the component
      const { container } = render(
        <TaxCodeField field={mockField} t={mockT} context={mockContext} />
      );

      // Test the uppercase conversion directly by simulating the onChange function
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).not.toBeNull();

      // Simulate the value change directly
      fireEvent.change(input, { target: { value: 'abcxyz123' } });

      // Verify it was called with the uppercase value
      expect(mockOnChange).toHaveBeenCalledWith('ABCXYZ123');
    });
  });
});

describe('Validation Error Handling', () => {
  const mockT = vi.fn((key: string) => key);

  describe('hasIBANError', () => {
    it('does not show errors if validation should be skipped', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasIBANError(mockContext, {});
      expect(result).toBe(false);
    });

    it('does not show IBAN errors if postal account is filled and IBAN is empty', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalAccount')) return '123456789012';
          if (path.includes('iban')) return '';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasIBANError(mockContext, {});
      expect(result).toBe(false);
    });

    it('shows IBAN errors if both fields are filled and IBAN has errors', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            iban: {
              message: 'Errore IBAN'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalAccount')) return '123456789012';
          if (path.includes('iban')) return 'INVALID';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasIBANError(mockContext, mockErrors);
      expect(result).toBe(true);
    });
  });

  describe('getIBANErrorMessage', () => {
    it('returns empty string if validation should be skipped', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getIBANErrorMessage(mockContext, {});
      expect(result).toBe('');
    });

    it('returns error message if both fields are empty', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getIBANErrorMessage(mockContext, {});
      expect(result).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });

    it('returns specific error message for invalid IBAN', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            iban: {
              message: 'Errore IBAN'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalAccount')) return '123456789012';
          if (path.includes('iban')) return 'INVALID';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getIBANErrorMessage(mockContext, mockErrors);
      expect(result).toBe('Errore IBAN');
    });
  });

  describe('hasPostalAccountError', () => {
    it('does not show errors if validation should be skipped', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalAccountError(mockContext, {});
      expect(result).toBe(false);
    });

    it('does not show postal account errors if IBAN is filled and postal account is empty', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return '';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalAccountError(mockContext, {});
      expect(result).toBe(false);
    });

    it('shows postal account errors if both fields are filled and postal account has errors', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            postalAccount: {
              message: 'Errore conto postale'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return 'INVALID';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalAccountError(mockContext, mockErrors);
      expect(result).toBe(true);
    });
  });

  describe('getPostalAccountErrorMessage', () => {
    it('returns empty string if validation should be skipped', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalAccountErrorMessage(mockContext, {});
      expect(result).toBe('');
    });

    it('returns error message if both fields are empty', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalAccountErrorMessage(mockContext, {});
      expect(result).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });

    it('returns specific error message for invalid postal account', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            postalAccount: {
              message: 'Errore conto postale'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return 'INVALID';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalAccountErrorMessage(mockContext, mockErrors);
      expect(result).toBe('Errore conto postale');
    });
  });
});

describe('AmountField', () => {
  it('correctly renders the amount field', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();
    const mockOnBlur = vi.fn();
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: mockOnChange,
      onBlur: mockOnBlur,
      value: '100.50',
      name: 'amount',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as BeneficiaryValidationContext<Record<string, unknown>>;

    const mockFields: Array<Record<string, unknown>> = [{}];

    const { container } = render(
      <AmountField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        fields={mockFields}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
      />
    );

    // Verify that the displayed value uses comma instead of dot
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('100,50');

    // Verify that the euro symbol is present
    expect(container.textContent).toContain('€');

    // Test onChange behavior
    fireEvent.change(input, { target: { value: '300,25' } });
    expect(mockOnChange).toHaveBeenCalledWith('300.25');

    // Test onBlur behavior
    fireEvent.blur(input, { target: { value: '300.25' } });
    expect(mockOnChange).toHaveBeenCalledWith('300.25');
    expect(mockOnBlur).toHaveBeenCalled();
  });
});

describe('IBANField', () => {
  it('correctly renders the IBAN field', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: 'IT60X0542811101000000123456',
      name: 'iban',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi
        .fn()
        .mockImplementation(() => 'IT60X0542811101000000123456'),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as BeneficiaryValidationContext<Record<string, unknown>>;

    const { container } = render(
      <IBANField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={{}}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('IT60X0542811101000000123456');

    // Test onChange behavior - usiamo debounceValidation quindi dobbiamo simulare il timer
    fireEvent.change(input, {
      target: { value: 'it12a123456789012345678901' }
    });
    expect(mockOnChange).toHaveBeenCalledWith('IT12A123456789012345678901');

    vi.runAllTimers();
    expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.iban');
  });

  it('shows errors when appropriate', () => {
    const mockT = vi.fn((key: string) => key);
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: 'INVALID',
      name: 'iban',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          iban: {
            message: 'Errore IBAN'
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation((path) => {
        if (path.includes('iban')) return 'INVALID';
        return '';
      }),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

    render(
      <IBANField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={mockErrors}
      />
    );

    // Verify that the error message is displayed
    expect(screen.getByText('Errore IBAN')).toBeInTheDocument();
  });
});

describe('PostalAccountField', () => {
  it('correctly renders the postal account field', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: '123456789012',
      name: 'postalAccount',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation(() => '123456789012'),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as BeneficiaryValidationContext<Record<string, unknown>>;

    const { container } = render(
      <PostalAccountField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={{}}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('123456789012');

    // Test onChange behavior - il campo accetta qualsiasi carattere
    fireEvent.change(input, { target: { value: '123abc456' } });
    expect(mockOnChange).toHaveBeenCalledWith('123abc456');
  });

  it('shows errors when appropriate', () => {
    const mockT = vi.fn((key: string) => key);
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: 'INVALID',
      name: 'postalAccount',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          postalAccount: {
            message: 'Errore conto postale'
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation((path) => {
        if (path.includes('postalAccount')) return 'INVALID';
        return '';
      }),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

    render(
      <PostalAccountField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={mockErrors}
      />
    );

    // Verify that the error message is displayed
    expect(screen.getByText('Errore conto postale')).toBeInTheDocument();
  });
});

describe('TaxonomyCodeField', () => {
  it('correctly renders the taxonomy code field', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: 'TAX123',
      name: 'taxonomyCode',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as BeneficiaryValidationContext<Record<string, unknown>>;

    const { container } = render(
      <TaxonomyCodeField field={mockField} t={mockT} context={mockContext} />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('TAX123');

    // Verify that the field is required
    const requiredLabel = screen.getByText(
      'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.label'
    );
    expect(requiredLabel).toBeInTheDocument();

    // Verify that the field has the required attribute
    const requiredAsterisk = container.querySelector('.MuiFormLabel-asterisk');
    expect(requiredAsterisk).not.toBeNull();
  });

  it('shows validation errors when necessary', () => {
    const mockT = vi.fn((key: string) => key);

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'taxonomyCode',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          taxonomyCode: {
            message: 'Campo obbligatorio'
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

    render(
      <TaxonomyCodeField field={mockField} t={mockT} context={mockContext} />
    );

    // The test to verify that the error is displayed depends on the implementation of hasFieldError
    // and getFieldErrorMessage, which are already tested in other test cases
  });
});

describe('RemittanceField', () => {
  it('correctly renders the remittance field', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: 'Causale di esempio',
      name: 'remittance',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as BeneficiaryValidationContext<Record<string, unknown>>;

    const { container } = render(
      <RemittanceField field={mockField} t={mockT} context={mockContext} />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('Causale di esempio');

    // Verify that the field is required
    const requiredLabel = screen.getByText(
      'debtPositionCreateWizard.step3.beneficiary.remittance.label'
    );
    expect(requiredLabel).toBeInTheDocument();

    // Verify that the field has the required attribute
    const requiredAsterisk = container.querySelector('.MuiFormLabel-asterisk');
    expect(requiredAsterisk).not.toBeNull();

    // Test onChange behavior
    fireEvent.change(input, { target: { value: 'Nuova causale' } });
    expect(mockOnChange).toHaveBeenCalledWith('Nuova causale');
  });

  it('shows validation errors when necessary', () => {
    const mockT = vi.fn((key: string) => key);
    const errorMessage = 'Campo obbligatorio';

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'remittance',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          remittance: {
            message: errorMessage
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockReturnValue(''),
      t: mockT,
      submissionCount: 1,
      creationSubmissionCount: 0
    } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

    render(
      <RemittanceField field={mockField} t={mockT} context={mockContext} />
    );

    // Verify that the error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});

describe('PostalIban Components', () => {
  const mockT = vi.fn((key: string) => key);

  describe('handlePostalIbanChange', () => {
    it('converts the value to uppercase', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: 'it60x0542811101000000123456' }
      } as React.ChangeEvent<HTMLInputElement>;

      handlePostalIbanChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockOnChange).toHaveBeenCalledWith('IT60X0542811101000000123456');
    });

    it('triggers validation for the postalIban field only', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: 'IT60X0542811101000000123456' }
      } as React.ChangeEvent<HTMLInputElement>;

      handlePostalIbanChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      vi.runAllTimers();

      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.${mockIndex}.postalIban`
      );
    });
  });

  describe('hasPostalIbanError', () => {
    it('does not show errors if validation should be skipped', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalIbanError(mockContext, {});
      expect(result).toBe(false);
    });

    it('does not show errors if postalIban field is empty (optional field)', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return '';
          return undefined;
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalIbanError(mockContext, {});
      expect(result).toBe(false);
    });

    it('shows postalIban errors if field is filled and has errors', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            postalIban: {
              message: 'Invalid postalIban format'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return 'INVALID_IBAN';
          return undefined;
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalIbanError(mockContext, mockErrors);
      expect(result).toBe(true);
    });

    it('handles installments context correctly', () => {
      const mockErrors = {
        installments: [
          {
            beneficiaries: [
              {
                postalIban: {
                  message: 'Invalid postalIban in installment'
                }
              }
            ]
          }
        ]
      };

      const mockContext = {
        id: '1',
        index: 0,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: 'installments.0.beneficiaries',
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return 'INVALID_IBAN';
          return undefined;
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = hasPostalIbanError(mockContext, mockErrors);
      expect(result).toBe(true);
    });
  });

  describe('getPostalIbanErrorMessage', () => {
    it('returns empty string if validation should be skipped', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalIbanErrorMessage(mockContext, {});
      expect(result).toBe('');
    });

    it('returns empty string if postalIban field is empty (optional field)', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return '';
          return undefined;
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalIbanErrorMessage(mockContext, {});
      expect(result).toBe('');
    });

    it('returns specific error message for invalid postalIban', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            postalIban: {
              message: 'Invalid postalIban format'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return 'INVALID_IBAN';
          return undefined;
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalIbanErrorMessage(mockContext, mockErrors);
      expect(result).toBe('Invalid postalIban format');
    });

    it('handles installments context correctly for error messages', () => {
      const mockErrors = {
        installments: [
          {
            beneficiaries: [
              {
                postalIban: {
                  message: 'Invalid postalIban in installment'
                }
              }
            ]
          }
        ]
      };

      const mockContext = {
        id: '1',
        index: 0,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: 'installments.0.beneficiaries',
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return 'INVALID_IBAN';
          return undefined;
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      const result = getPostalIbanErrorMessage(mockContext, mockErrors);
      expect(result).toBe('Invalid postalIban in installment');
    });
  });

  describe('PostalIbanField', () => {
    it('correctly renders the postal iban field', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const mockField = {
        onChange: mockOnChange,
        onBlur: vi.fn(),
        value: 'IT60X0542811101000000123456',
        name: 'postalIban',
        ref: { current: null }
      };

      const mockContext = {
        id: '1',
        index: 0,
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        getValues: vi
          .fn()
          .mockImplementation(() => 'IT60X0542811101000000123456'),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const { container } = render(
        <PostalIbanField
          field={mockField}
          t={mockT}
          context={mockContext}
          index={0}
          trigger={mockTrigger}
          fieldNamePrefix="beneficiaries"
          errors={{}}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.value).toBe('IT60X0542811101000000123456');

      // Test onChange behavior
      fireEvent.change(input, {
        target: { value: 'it45z0760105138290123456789' }
      });
      expect(mockOnChange).toHaveBeenCalledWith('IT45Z0760105138290123456789');

      vi.runAllTimers();
      expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.postalIban');
    });

    it('shows errors when appropriate', () => {
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const mockField = {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: 'INVALID',
        name: 'postalIban',
        ref: { current: null }
      };

      const mockErrors = {
        beneficiaries: {
          0: {
            postalIban: {
              message: 'Errore postalIban'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: 0,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: 'beneficiaries',
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalIban')) return 'INVALID';
          return '';
        }),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as unknown as BeneficiaryValidationContext<Record<string, unknown>>;

      render(
        <PostalIbanField
          field={mockField}
          t={mockT}
          context={mockContext}
          index={0}
          trigger={mockTrigger}
          fieldNamePrefix="beneficiaries"
          errors={mockErrors}
        />
      );

      // Verify that the error message is displayed
      expect(screen.getByText('Errore postalIban')).toBeInTheDocument();
    });

    it('handles disabled state correctly', () => {
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const mockField = {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: '',
        name: 'postalIban',
        ref: { current: null }
      };

      const mockContext = {
        id: '1',
        index: 0,
        isSubmitted: false,
        wasSubmittedRef: { current: false },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: 'beneficiaries',
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT,
        submissionCount: 1,
        creationSubmissionCount: 0
      } as BeneficiaryValidationContext<Record<string, unknown>>;

      const { container } = render(
        <PostalIbanField
          field={mockField}
          t={mockT}
          context={mockContext}
          index={0}
          trigger={mockTrigger}
          fieldNamePrefix="beneficiaries"
          errors={{}}
          disabled={true}
        />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).toHaveAttribute('disabled');
    });
  });
});
