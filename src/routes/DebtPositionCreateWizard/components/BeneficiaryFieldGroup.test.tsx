import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormTrigger
} from 'react-hook-form';
import {
  BeneficiaryIdentityFields,
  BeneficiaryAmountFields,
  BeneficiaryPaymentFields,
  BeneficiaryClassificationFields
} from './BeneficiaryFieldGroup';
import { BeneficiaryValidationContext } from '../../../utils/BeneficiaryFieldHelpers';

// Mock delle dipendenze
vi.mock('./BeneficiaryFieldComponents', () => ({
  EntityNameField: ({
    t,
    disabled
  }: {
    field: unknown;
    t: (key: string) => string;
    disabled: boolean;
    context: unknown;
  }) => (
    <div data-testid="entity-name-field" data-disabled={disabled}>
      {t('debtPositionCreateWizard.step3.beneficiary.entityName.label')}
    </div>
  ),
  TaxCodeField: ({
    t,
    disabled
  }: {
    field: unknown;
    t: (key: string) => string;
    disabled: boolean;
    context: unknown;
  }) => (
    <div data-testid="tax-code-field" data-disabled={disabled}>
      {t('debtPositionCreateWizard.step3.beneficiary.taxCode.label')}
    </div>
  ),
  AmountField: ({
    t,
    disabled,
    index,
    fields
  }: {
    field: unknown;
    t: (key: string) => string;
    disabled: boolean;
    context: unknown;
    index: number;
    fields: Array<unknown>;
    trigger: unknown;
    fieldNamePrefix: string;
  }) => (
    <div
      data-testid="amount-field"
      data-disabled={disabled}
      data-index={index}
      data-fields-length={fields.length}
    >
      {t('debtPositionCreateWizard.step3.beneficiary.amount.label')}
    </div>
  ),
  IBANField: ({
    t,
    disabled,
    index
  }: {
    field: unknown;
    t: (key: string) => string;
    disabled: boolean;
    context: unknown;
    index: number;
    trigger: unknown;
    fieldNamePrefix: string;
    errors: unknown;
  }) => (
    <div data-testid="iban-field" data-disabled={disabled} data-index={index}>
      {t('debtPositionCreateWizard.step3.beneficiary.iban.label')}
    </div>
  ),
  PostalAccountField: ({
    t,
    disabled,
    index
  }: {
    field: unknown;
    t: (key: string) => string;
    disabled: boolean;
    context: unknown;
    index: number;
    trigger: unknown;
    fieldNamePrefix: string;
    errors: unknown;
  }) => (
    <div
      data-testid="postal-account-field"
      data-disabled={disabled}
      data-index={index}
    >
      {t('debtPositionCreateWizard.step3.beneficiary.postalAccount.label')}
    </div>
  ),
  TaxonomyCodeField: ({
    t,
    disabled
  }: {
    field: unknown;
    t: (key: string) => string;
    disabled: boolean;
    context: unknown;
  }) => (
    <div data-testid="taxonomy-code-field" data-disabled={disabled}>
      {t('debtPositionCreateWizard.step3.beneficiary.taxonomyCode.label')}
    </div>
  )
}));

vi.mock('../../../utils/BeneficiaryFieldHelpers', () => ({
  buildBeneficiaryFieldPath: vi
    .fn()
    .mockImplementation((prefix, index, field) => `${prefix}.${index}.${field}`)
}));

// Mock di moduli esterni
vi.mock('react-hook-form', () => ({
  Controller: ({
    name,
    render
  }: {
    name: string;
    control: unknown;
    rules: unknown;
    render: (args: { field: Record<string, unknown> }) => JSX.Element;
  }) => (
    <div data-testid="controller" data-name={name}>
      {render({
        field: {
          value: '',
          onChange: vi.fn(),
          onBlur: vi.fn(),
          name,
          ref: { current: null }
        }
      })}
    </div>
  )
}));

// Tipi per i mocks necessari
type TestFormValues = {
  beneficiaries: Array<{
    entityName: string;
    amount: string;
    taxCode: string;
    iban: string;
    postalAccount: string;
    taxonomyCode: string;
  }>;
};

// Proprietà comuni di test
type CommonTestProps = {
  index: number;
  fieldNamePrefix: string;
  disabled: boolean;
};

// Interfaccia per i validatori di importo
type AmountValidators = {
  isValidTotalAmount: () => boolean;
  isSingleBeneficiaryAmountValid: (hasSingleBeneficiary: boolean) => boolean;
  validateTotalAmount: () => string | true;
  validateSingleBeneficiary: (
    amount: string,
    fieldsLength: number
  ) => string | true;
  isBeneficiaryAmountValid: (
    index: number,
    hasSingleBeneficiary: boolean
  ) => boolean;
};

describe('BeneficiaryFieldGroup', () => {
  // Setup dei mocks comuni
  let mockControl: Control<TestFormValues>;
  let mockValidationContext: BeneficiaryValidationContext<TestFormValues>;
  let mockTranslation: (key: string) => string;
  let mockTrigger: UseFormTrigger<TestFormValues>;
  let mockGetValues: UseFormGetValues<TestFormValues>;
  let mockErrors: FieldErrors<TestFormValues>;
  let mockFieldValidators: {
    validateBeneficiaryTaxCode: (value: string) => string | undefined;
    validateIBAN: (value: string) => string | undefined;
    validatePostalAccount: (value: string) => string | undefined;
    validatePaymentMethod: (
      value1: string,
      value2: string
    ) => string | undefined;
  };
  let mockValidators: AmountValidators;

  // Proprietà di test comuni
  const commonProps: CommonTestProps = {
    index: 0,
    fieldNamePrefix: 'beneficiaries',
    disabled: false
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mocks
    mockTranslation = vi.fn().mockImplementation((key) => key);
    mockTrigger = vi.fn();
    mockGetValues = vi.fn();
    mockControl = {} as Control<TestFormValues>;
    mockErrors = {} as FieldErrors<TestFormValues>;
    mockValidationContext = {
      id: 'test-id',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: mockGetValues,
      t: mockTranslation
    };
    mockFieldValidators = {
      validateBeneficiaryTaxCode: vi.fn(),
      validateIBAN: vi.fn(),
      validatePostalAccount: vi.fn(),
      validatePaymentMethod: vi.fn()
    };
    mockValidators = {
      isValidTotalAmount: vi.fn().mockReturnValue(true),
      isSingleBeneficiaryAmountValid: vi.fn().mockReturnValue(true),
      validateTotalAmount: vi.fn().mockReturnValue(true),
      validateSingleBeneficiary: vi.fn().mockReturnValue(true),
      isBeneficiaryAmountValid: vi.fn().mockReturnValue(true)
    };
  });

  describe('BeneficiaryIdentityFields', () => {
    it('renderizza correttamente i campi di identità del beneficiario', () => {
      render(
        <BeneficiaryIdentityFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={commonProps.disabled}
          t={mockTranslation}
        />
      );

      // Verifica che i due campi (EntityNameField e TaxCodeField) siano renderizzati
      expect(screen.getByTestId('entity-name-field')).toBeInTheDocument();
      expect(screen.getByTestId('tax-code-field')).toBeInTheDocument();

      // Verifica che i Controller siano impostati correttamente
      const controllers = screen.getAllByTestId('controller');
      expect(controllers).toHaveLength(2);
      expect(controllers[0]).toHaveAttribute(
        'data-name',
        'beneficiaries.0.entityName'
      );
      expect(controllers[1]).toHaveAttribute(
        'data-name',
        'beneficiaries.0.taxCode'
      );
    });

    it('gestisce correttamente lo stato disabled', () => {
      render(
        <BeneficiaryIdentityFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={true}
          t={mockTranslation}
        />
      );

      expect(screen.getByTestId('entity-name-field')).toHaveAttribute(
        'data-disabled',
        'true'
      );
      expect(screen.getByTestId('tax-code-field')).toHaveAttribute(
        'data-disabled',
        'true'
      );
    });
  });

  describe('BeneficiaryAmountFields', () => {
    it('renderizza correttamente il campo importo', () => {
      const mockFields = [{ id: 'test' }];

      render(
        <BeneficiaryAmountFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={commonProps.disabled}
          fields={mockFields}
          validators={mockValidators}
          trigger={mockTrigger}
          t={mockTranslation}
        />
      );

      // Verifica che il campo Amount sia renderizzato correttamente
      expect(screen.getByTestId('amount-field')).toBeInTheDocument();
      expect(screen.getByTestId('amount-field')).toHaveAttribute(
        'data-index',
        '0'
      );
      expect(screen.getByTestId('amount-field')).toHaveAttribute(
        'data-fields-length',
        '1'
      );

      // Verifica che il Controller sia impostato correttamente
      const controller = screen.getByTestId('controller');
      expect(controller).toHaveAttribute('data-name', 'beneficiaries.0.amount');
    });

    it('applica correttamente lo stato disabled', () => {
      const mockFields = [{ id: 'test' }];

      render(
        <BeneficiaryAmountFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={true}
          fields={mockFields}
          validators={mockValidators}
          trigger={mockTrigger}
          t={mockTranslation}
        />
      );

      expect(screen.getByTestId('amount-field')).toHaveAttribute(
        'data-disabled',
        'true'
      );
    });
  });

  describe('BeneficiaryPaymentFields', () => {
    it('renderizza correttamente i campi di pagamento', () => {
      render(
        <BeneficiaryPaymentFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={commonProps.disabled}
          getValues={mockGetValues}
          trigger={mockTrigger}
          errors={mockErrors}
          fieldValidators={mockFieldValidators}
          t={mockTranslation}
        />
      );

      // Verifica che i campi di pagamento siano renderizzati
      expect(screen.getByTestId('iban-field')).toBeInTheDocument();
      expect(screen.getByTestId('postal-account-field')).toBeInTheDocument();

      // Verifica che i Controller siano impostati correttamente
      const controllers = screen.getAllByTestId('controller');
      expect(controllers).toHaveLength(2);
      expect(controllers[0]).toHaveAttribute(
        'data-name',
        'beneficiaries.0.iban'
      );
      expect(controllers[1]).toHaveAttribute(
        'data-name',
        'beneficiaries.0.postalAccount'
      );
    });

    it('applica correttamente lo stato disabled', () => {
      render(
        <BeneficiaryPaymentFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={true}
          getValues={mockGetValues}
          trigger={mockTrigger}
          errors={mockErrors}
          fieldValidators={mockFieldValidators}
          t={mockTranslation}
        />
      );

      expect(screen.getByTestId('iban-field')).toHaveAttribute(
        'data-disabled',
        'true'
      );
      expect(screen.getByTestId('postal-account-field')).toHaveAttribute(
        'data-disabled',
        'true'
      );
    });
  });

  describe('BeneficiaryClassificationFields', () => {
    it('renderizza correttamente il campo di classificazione', () => {
      render(
        <BeneficiaryClassificationFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={commonProps.disabled}
          t={mockTranslation}
        />
      );

      // Verifica che il campo taxonomyCode sia renderizzato
      expect(screen.getByTestId('taxonomy-code-field')).toBeInTheDocument();

      // Verifica che il Controller sia impostato correttamente
      const controller = screen.getByTestId('controller');
      expect(controller).toHaveAttribute(
        'data-name',
        'beneficiaries.0.taxonomyCode'
      );
    });

    it('applica correttamente lo stato disabled', () => {
      render(
        <BeneficiaryClassificationFields<TestFormValues>
          control={mockControl}
          index={commonProps.index}
          fieldNamePrefix={commonProps.fieldNamePrefix}
          validationContext={mockValidationContext}
          disabled={true}
          t={mockTranslation}
        />
      );

      expect(screen.getByTestId('taxonomy-code-field')).toHaveAttribute(
        'data-disabled',
        'true'
      );
    });
  });
});
