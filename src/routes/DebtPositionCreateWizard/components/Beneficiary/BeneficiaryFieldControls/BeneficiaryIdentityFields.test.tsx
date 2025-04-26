import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeneficiaryIdentityFields } from './BeneficiaryIdentityFields';
import { Control, FieldValues } from 'react-hook-form';
import { BeneficiaryValidationContext } from '../../../../../utils/BeneficiaryFieldHelpers';
import * as BeneficiaryFieldHelpers from '../../../../../utils/BeneficiaryFieldHelpers';

// Mock delle dipendenze
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
    // Simula un campo di input per i test
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

  it('dovrebbe renderizzare correttamente i campi EntityName, TaxCode e Remittance', () => {
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

    // Verifica che tutti i campi siano renderizzati
    expect(screen.getByTestId('entity-name-field')).toBeInTheDocument();
    expect(screen.getByTestId('tax-code-field')).toBeInTheDocument();
    expect(screen.getByTestId('remittance-field')).toBeInTheDocument();
  });

  it('dovrebbe utilizzare buildBeneficiaryFieldPath con i parametri corretti', () => {
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

    // Verifica che buildBeneficiaryFieldPath sia chiamato con i parametri corretti
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

  it('dovrebbe passare le proprietà corrette ai campi', () => {
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

    // Verifica che i campi controllati siano renderizzati con i nomi corretti
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

  it('dovrebbe passare le regole di validazione correttamente', () => {
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

    // Verifica che la funzione di traduzione sia chiamata con le chiavi corrette
    expect(mockT).toHaveBeenCalledWith(
      'debtPositionCreateWizard.step3.beneficiary.entityName.required'
    );

    expect(mockT).toHaveBeenCalledWith(
      'debtPositionCreateWizard.step3.beneficiary.taxCode.required'
    );

    expect(mockT).toHaveBeenCalledWith(
      'debtPositionCreateWizard.step3.beneficiary.remittance.required'
    );
  });
});
