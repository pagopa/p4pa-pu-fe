import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Control, FieldValues } from 'react-hook-form';
import { BeneficiaryPaymentFields } from './BeneficiaryPaymentFields';
import { BeneficiaryValidationContext } from '../../../../../utils/BeneficiaryFieldHelpers';

const mockRulesForIban = {
  validate: {
    ibanFormat: vi.fn(),
    paymentMethod: vi.fn()
  }
};

const mockRulesForPostalAccount = {
  validate: {
    postalAccountFormat: vi.fn(),
    paymentMethod: vi.fn()
  }
};

let ibanRules = { ...mockRulesForIban };
let postalAccountRules = { ...mockRulesForPostalAccount };

vi.mock('./BeneficiaryControlledField', () => ({
  BeneficiaryControlledField: ({
    name,
    renderField,
    rules
  }: {
    name: string;
    control: Control<FieldValues>;
    rules: Record<string, unknown>;
    renderField: (props: { field: Record<string, unknown> }) => JSX.Element;
  }) => {
    if (name && name.includes('.iban')) {
      ibanRules = rules as typeof mockRulesForIban;
    }
    if (name && name.includes('.postalAccount')) {
      postalAccountRules = rules as typeof mockRulesForPostalAccount;
    }
    return (
      <div data-testid="controlled-field" data-name={name}>
        {renderField({
          field: {
            name,
            value: '',
            onChange: vi.fn(),
            onBlur: vi.fn(),
            ref: vi.fn()
          }
        })}
      </div>
    );
  }
}));

type FieldComponentProps = {
  field: {
    name: string;
    value: string;
    onChange: (...event: Array<unknown>) => void;
    onBlur: () => void;
    ref: React.Ref<HTMLInputElement>;
  };
  t: (key: string) => string;
  disabled?: boolean;
  context: Record<string, unknown>;
  index: number;
  trigger: (...args: Array<unknown>) => void;
  fieldNamePrefix: string;
  errors: Record<string, unknown>;
};

vi.mock('../BeneficiaryFieldComponents', () => ({
  IBANField: ({ field, t, disabled, index }: FieldComponentProps) => (
    <div
      data-testid="iban-field"
      data-name={field.name}
      data-disabled={disabled ? 'true' : 'false'}
      data-index={String(index)}
    >
      {t('debtPositionCreateWizard.step3.beneficiary.iban.label')}
    </div>
  ),
  PostalAccountField: ({ field, t, disabled, index }: FieldComponentProps) => (
    <div
      data-testid="postal-account-field"
      data-name={field.name}
      data-disabled={disabled ? 'true' : 'false'}
      data-index={String(index)}
    >
      {t('debtPositionCreateWizard.step3.beneficiary.postalAccount.label')}
    </div>
  )
}));

vi.mock('../../../../../utils/BeneficiaryFieldHelpers', () => ({
  buildBeneficiaryFieldPath: (
    fieldNamePrefix: string,
    index: number,
    field: string
  ): string => `${fieldNamePrefix}.${index}.${field}`,
  BeneficiaryValidationContext: {}
}));

type TestFormValues = {
  beneficiaries: Array<{
    iban: string;
    postalAccount: string;
    [key: string]: unknown;
  }>;
};

describe('BeneficiaryPaymentFields', () => {
  const mockProps = {
    control: {} as Control<TestFormValues>,
    index: 0,
    fieldNamePrefix: 'beneficiaries',
    validationContext: {} as BeneficiaryValidationContext<TestFormValues>,
    disabled: false,
    getValues: vi.fn(),
    trigger: vi.fn(),
    errors: {},
    fieldValidators: {
      validateIBAN: vi.fn().mockReturnValue(undefined),
      validatePostalAccount: vi.fn().mockReturnValue(undefined),
      validatePaymentMethod: vi.fn().mockReturnValue(undefined),
      validateBeneficiaryTaxCode: vi.fn().mockReturnValue(undefined)
    },
    t: (key: string) => key
  };

  beforeEach(() => {
    vi.clearAllMocks();
    ibanRules = { ...mockRulesForIban };
    postalAccountRules = { ...mockRulesForPostalAccount };

    mockProps.getValues.mockImplementation((path: string) => {
      if (path === 'beneficiaries.0.iban') return '';
      if (path === 'beneficiaries.0.postalAccount') return '';
      if (path.includes('iban')) return '';
      if (path.includes('postalAccount')) return '';
      return undefined;
    });
  });

  it('should render both IBAN and postal account fields', () => {
    render(<BeneficiaryPaymentFields {...mockProps} />);

    expect(screen.getByTestId('iban-field')).toBeInTheDocument();
    expect(screen.getByTestId('postal-account-field')).toBeInTheDocument();
  });

  it('should set proper validation rules for IBAN field', () => {
    render(<BeneficiaryPaymentFields {...mockProps} />);

    expect(ibanRules.validate).toHaveProperty('ibanFormat');
    expect(ibanRules.validate).toHaveProperty('paymentMethod');

    expect(ibanRules.validate.ibanFormat).toBe(
      mockProps.fieldValidators.validateIBAN
    );
  });

  it('should set proper validation rules for postal account field', () => {
    render(<BeneficiaryPaymentFields {...mockProps} />);

    expect(postalAccountRules.validate).toHaveProperty('postalAccountFormat');
    expect(postalAccountRules.validate).toHaveProperty('paymentMethod');

    expect(postalAccountRules.validate.postalAccountFormat).toBe(
      mockProps.fieldValidators.validatePostalAccount
    );
  });

  it('should pass correct props to IBANField', () => {
    render(<BeneficiaryPaymentFields {...mockProps} />);

    const ibanField = screen.getByTestId('iban-field');
    expect(ibanField).toHaveAttribute('data-disabled', 'false');
    expect(ibanField).toHaveAttribute('data-index', '0');
  });

  it('should pass correct props to PostalAccountField', () => {
    render(<BeneficiaryPaymentFields {...mockProps} />);

    const postalAccountField = screen.getByTestId('postal-account-field');
    expect(postalAccountField).toHaveAttribute('data-disabled', 'false');
    expect(postalAccountField).toHaveAttribute('data-index', '0');
  });

  it('should handle disabled state correctly', () => {
    render(<BeneficiaryPaymentFields {...mockProps} disabled={true} />);

    expect(screen.getByTestId('iban-field')).toHaveAttribute(
      'data-disabled',
      'true'
    );
    expect(screen.getByTestId('postal-account-field')).toHaveAttribute(
      'data-disabled',
      'true'
    );
  });

  it('should validate payment method when IBAN has a value', () => {
    const ibanValue = 'IT12A1234567890123456789012';
    const postalValue = '';

    mockProps.getValues.mockImplementation((path: string) => {
      if (path === 'beneficiaries.0.iban') return ibanValue;
      if (path === 'beneficiaries.0.postalAccount') return postalValue;
      if (path.includes('iban')) return ibanValue;
      if (path.includes('postalAccount')) return postalValue;
      return undefined;
    });

    render(<BeneficiaryPaymentFields {...mockProps} />);

    const paymentMethodValidator = ibanRules.validate.paymentMethod;

    if (typeof paymentMethodValidator === 'function') {
      paymentMethodValidator(ibanValue);
    }

    expect(
      mockProps.fieldValidators.validatePaymentMethod
    ).toHaveBeenCalledWith(ibanValue, postalValue);
  });
});
