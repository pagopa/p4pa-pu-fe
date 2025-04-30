import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeneficiaryIdentityFields } from './BeneficiaryIdentityFields';
import { Control, FieldValues } from 'react-hook-form';
import { BeneficiaryValidationContext } from '../../../../../utils/BeneficiaryFieldHelpers';
import * as BeneficiaryFieldHelpers from '../../../../../utils/BeneficiaryFieldHelpers';

// Mock dependencies
vi.mock('./BeneficiaryControlledField', () => ({
  BeneficiaryControlledField: ({
    name,
    renderField
  }: {
    name: string;
    control: Control<FieldValues>;
    rules?: Record<string, unknown>;
    renderField: (props: { field: Record<string, unknown> }) => JSX.Element;
  }) => {
    // Simulate an input field for tests
    const field = {
      name,
      value: '',
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn()
    };
    return (
      <div data-testid={`controlled-field-${name}`}>
        {renderField({ field })}
      </div>
    );
  }
}));

vi.mock('../../../../../utils/BeneficiaryFieldHelpers', () => ({
  buildBeneficiaryFieldPath: vi.fn(
    (prefix, index, field) => `${prefix}.${index}.${field}`
  ),
  BeneficiaryValidationContext: vi.fn()
}));

vi.mock('../BeneficiaryFieldComponents', () => ({
  EntityNameField: ({
    field
  }: {
    field: Record<string, unknown>;
    t: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="entity-name-field">
      EntityNameField
      <input
        data-testid="entity-name-input"
        name={field.name as string}
        onChange={field.onChange as () => void}
      />
    </div>
  ),
  TaxCodeField: ({
    field
  }: {
    field: Record<string, unknown>;
    t: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="tax-code-field">
      TaxCodeField
      <input
        data-testid="tax-code-input"
        name={field.name as string}
        onChange={field.onChange as () => void}
      />
    </div>
  ),
  RemittanceField: ({
    field
  }: {
    field: Record<string, unknown>;
    t: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="remittance-field">
      RemittanceField
      <input
        data-testid="remittance-input"
        name={field.name as string}
        onChange={field.onChange as () => void}
      />
    </div>
  )
}));

describe('BeneficiaryIdentityFields', () => {
  const mockControl = {} as Control<FieldValues>;
  const mockIndex = 0;
  const mockFieldNamePrefix = 'beneficiaries';
  const mockValidationContext = {
    id: 'test-id',
    index: 0,
    isSubmitted: false,
    wasSubmittedRef: { current: false },
    existingBeneficiaries: {},
    errors: {},
    fieldNamePrefix: 'beneficiaries',
    getValues: vi.fn(),
    t: vi.fn()
  } as unknown as BeneficiaryValidationContext<FieldValues>;
  const mockT = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly render EntityName, TaxCode and Remittance fields', () => {
    render(
      <BeneficiaryIdentityFields
        control={mockControl}
        index={mockIndex}
        fieldNamePrefix={mockFieldNamePrefix}
        validationContext={mockValidationContext}
        disabled={false}
        t={mockT}
      />
    );

    // Verify that all fields are rendered
    expect(screen.getByTestId('entity-name-field')).toBeInTheDocument();
    expect(screen.getByTestId('tax-code-field')).toBeInTheDocument();
    expect(screen.getByTestId('remittance-field')).toBeInTheDocument();
  });

  it('should use buildBeneficiaryFieldPath with correct parameters', () => {
    render(
      <BeneficiaryIdentityFields
        control={mockControl}
        index={mockIndex}
        fieldNamePrefix={mockFieldNamePrefix}
        validationContext={mockValidationContext}
        disabled={false}
        t={mockT}
      />
    );

    // Verify that buildBeneficiaryFieldPath is called with correct parameters
    expect(
      BeneficiaryFieldHelpers.buildBeneficiaryFieldPath
    ).toHaveBeenCalledWith(mockFieldNamePrefix, mockIndex, 'entityName');

    expect(
      BeneficiaryFieldHelpers.buildBeneficiaryFieldPath
    ).toHaveBeenCalledWith(mockFieldNamePrefix, mockIndex, 'taxCode');

    expect(
      BeneficiaryFieldHelpers.buildBeneficiaryFieldPath
    ).toHaveBeenCalledWith(mockFieldNamePrefix, mockIndex, 'remittance');
  });

  it('should pass correct properties to fields', () => {
    render(
      <BeneficiaryIdentityFields
        control={mockControl}
        index={mockIndex}
        fieldNamePrefix={mockFieldNamePrefix}
        validationContext={mockValidationContext}
        disabled={true}
        t={mockT}
      />
    );

    // Verify that controlled fields are rendered with correct names
    expect(
      screen.getByTestId('controlled-field-beneficiaries.0.entityName')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('controlled-field-beneficiaries.0.taxCode')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('controlled-field-beneficiaries.0.remittance')
    ).toBeInTheDocument();
  });

  it('should pass validation rules correctly', () => {
    render(
      <BeneficiaryIdentityFields
        control={mockControl}
        index={mockIndex}
        fieldNamePrefix={mockFieldNamePrefix}
        validationContext={mockValidationContext}
        disabled={false}
        t={mockT}
      />
    );

    // Verify that the translation function is called with correct keys
    expect(mockT).toHaveBeenCalledWith(
      'debtPositionCreateWizard.step3.beneficiary.entityName.required'
    );

    expect(mockT).toHaveBeenCalledWith(
      'debtPositionCreateWizard.step3.beneficiary.taxCodeOrVat.required'
    );

    expect(mockT).toHaveBeenCalledWith(
      'debtPositionCreateWizard.step3.beneficiary.remittance.required'
    );
  });
});
