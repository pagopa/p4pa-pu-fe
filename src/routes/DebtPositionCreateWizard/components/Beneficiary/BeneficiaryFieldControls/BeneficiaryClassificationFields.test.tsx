import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Control, FieldValues } from 'react-hook-form';
import { BeneficiaryClassificationFields } from './BeneficiaryClassificationFields';
import { BeneficiaryValidationContext } from '../../../../../utils/BeneficiaryFieldHelpers';

vi.mock('./BeneficiaryControlledField', () => ({
  BeneficiaryControlledField: ({
    name,
    renderField
  }: {
    name: string;
    control: Control<FieldValues>;
    rules: Record<string, unknown>;
    renderField: (props: { field: Record<string, unknown> }) => JSX.Element;
  }) => (
    <div data-testid="controlled-field" data-name={name}>
      {renderField({ field: { name, value: '', onChange: vi.fn() } })}
    </div>
  )
}));

vi.mock('../BeneficiaryFieldComponents', () => ({
  TaxonomyCodeField: ({
    field,
    disabled
  }: {
    field: Record<string, unknown>;
    t: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div
      data-testid="taxonomy-code-field"
      data-field-name={field.name}
      data-disabled={disabled ? 'true' : 'false'}
    >
      Taxonomy Code Field
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
    taxonomyCode: string;
    [key: string]: unknown;
  }>;
};

describe('BeneficiaryClassificationFields', () => {
  const mockControl = {} as Control<TestFormValues>;

  const mockT = vi.fn((key: string) => key);

  const mockValidationContext: BeneficiaryValidationContext<TestFormValues> = {
    id: '1',
    index: 0,
    isSubmitted: false,
    wasSubmittedRef: { current: false },
    existingBeneficiaries: {},
    errors: {},
    fieldNamePrefix: 'beneficiaries',
    getValues: vi.fn(),
    t: mockT,
    submissionCount: 0,
    creationSubmissionCount: 0
  };

  const defaultProps = {
    control: mockControl,
    index: 0,
    fieldNamePrefix: 'beneficiaries',
    validationContext: mockValidationContext,
    disabled: false,
    t: mockT
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the classification field correctly', () => {
    render(
      <BeneficiaryClassificationFields<TestFormValues> {...defaultProps} />
    );

    const controlledField = screen.getByTestId('controlled-field');
    expect(controlledField).toBeInTheDocument();
    expect(controlledField).toHaveAttribute(
      'data-name',
      'beneficiaries.0.taxonomyCode'
    );

    const taxonomyCodeField = screen.getByTestId('taxonomy-code-field');
    expect(taxonomyCodeField).toBeInTheDocument();
    expect(taxonomyCodeField).toHaveAttribute(
      'data-field-name',
      'beneficiaries.0.taxonomyCode'
    );
    expect(taxonomyCodeField).toHaveAttribute('data-disabled', 'false');
  });

  it('should apply the disabled state correctly', () => {
    render(
      <BeneficiaryClassificationFields<TestFormValues>
        {...defaultProps}
        disabled={true}
      />
    );

    const taxonomyCodeField = screen.getByTestId('taxonomy-code-field');
    expect(taxonomyCodeField).toHaveAttribute('data-disabled', 'true');
  });

  it('should pass the correct parameters to BeneficiaryControlledField', () => {
    render(
      <BeneficiaryClassificationFields<TestFormValues> {...defaultProps} />
    );

    const controlledField = screen.getByTestId('controlled-field');

    expect(controlledField).toHaveAttribute(
      'data-name',
      'beneficiaries.0.taxonomyCode'
    );

    const taxonomyCodeField = screen.getByTestId('taxonomy-code-field');
    expect(taxonomyCodeField).toBeInTheDocument();
  });

  it('should use a different index when specified', () => {
    render(
      <BeneficiaryClassificationFields<TestFormValues>
        {...defaultProps}
        index={2}
      />
    );

    const controlledField = screen.getByTestId('controlled-field');
    expect(controlledField).toHaveAttribute(
      'data-name',
      'beneficiaries.2.taxonomyCode'
    );
  });

  it('should use a different field prefix when specified', () => {
    render(
      <BeneficiaryClassificationFields<TestFormValues>
        {...defaultProps}
        fieldNamePrefix="installments.0.beneficiaries"
      />
    );

    const controlledField = screen.getByTestId('controlled-field');
    expect(controlledField).toHaveAttribute(
      'data-name',
      'installments.0.beneficiaries.0.taxonomyCode'
    );
  });
});
