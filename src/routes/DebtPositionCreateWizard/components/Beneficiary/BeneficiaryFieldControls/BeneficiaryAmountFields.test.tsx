import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useForm, FieldValues, Control } from 'react-hook-form';
import { BeneficiaryAmountFields } from './BeneficiaryAmountFields';
import { BeneficiaryValidationContext } from '../../../../../utils/BeneficiaryFieldHelpers';

vi.mock('../BeneficiaryFieldComponents', () => ({
  AmountField: vi.fn(({ field, t, disabled, context, index }) => (
    <div
      data-testid="mock-amount-field"
      data-name={field.name}
      data-disabled={disabled ? 'true' : 'false'}
      data-index={index}
      data-submitted={context.isSubmitted ? 'true' : 'false'}
    >
      {t('debtPositionCreateWizard.step3.beneficiary.amount.label')}
    </div>
  ))
}));

vi.mock('./BeneficiaryControlledField', () => ({
  BeneficiaryControlledField: vi.fn(({ renderField, name }) => {
    const field = { name };
    const fieldState = { error: null };
    return renderField({ field, fieldState });
  })
}));

vi.mock('../../../../../utils/BeneficiaryFieldHelpers', async () => {
  const actual = await vi.importActual(
    '../../../../../utils/BeneficiaryFieldHelpers'
  );
  return {
    ...actual,
    buildBeneficiaryFieldPath: vi.fn(
      (fieldNamePrefix, index, field) => `${fieldNamePrefix}.${index}.${field}`
    )
  };
});

type TestWrapperProps<T extends FieldValues> = {
  children: (props: {
    control: Control<T>;
    trigger: ReturnType<typeof useForm<T>>['trigger'];
  }) => React.ReactNode;
};

const TestWrapper = <T extends FieldValues>({
  children
}: TestWrapperProps<T>) => {
  const { control, trigger } = useForm<T>();
  return <>{children({ control, trigger })}</>;
};

describe('BeneficiaryAmountFields', () => {
  const t = vi.fn((key) => key);
  const validators = {
    validateSingleBeneficiary: vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_amount: string, _fieldsLength: number) => true as const
    ),
    validateTotalAmount: vi.fn(() => true as const),
    isValidTotalAmount: vi.fn(() => true),
    isSingleBeneficiaryAmountValid: vi.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_hasSingleBeneficiary: boolean) => true
    ),
    isBeneficiaryAmountValid: vi.fn(
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      (_index: number, _hasSingleBeneficiary: boolean) => true
    )
  };
  const fields = [{ id: '1' }];
  const index = 0;
  const fieldNamePrefix = 'installments[0].beneficiaries';
  const trigger = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('dovrebbe renderizzare correttamente il campo importo', () => {
    const validationContext: BeneficiaryValidationContext<FieldValues> = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: fieldNamePrefix,
      getValues: vi.fn(),
      t: t,
      submissionCount: 0,
      creationSubmissionCount: 0
    };

    render(
      <TestWrapper>
        {({ control }) => (
          <BeneficiaryAmountFields<FieldValues>
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={false}
            fields={fields}
            validators={validators}
            trigger={trigger}
            t={t}
          />
        )}
      </TestWrapper>
    );

    const amountField = screen.getByTestId('mock-amount-field');
    expect(amountField).toBeInTheDocument();
    expect(amountField).toHaveAttribute(
      'data-name',
      `${fieldNamePrefix}.${index}.amount`
    );
    expect(amountField).toHaveAttribute('data-disabled', 'false');
  });

  test('dovrebbe passare isSubmitted=true al contesto di validazione quando il form è stato inviato', () => {
    const validationContext: BeneficiaryValidationContext<FieldValues> = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: fieldNamePrefix,
      getValues: vi.fn(),
      t: t,
      submissionCount: 1,
      creationSubmissionCount: 0
    };

    render(
      <TestWrapper>
        {({ control }) => (
          <BeneficiaryAmountFields<FieldValues>
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={false}
            fields={fields}
            validators={validators}
            trigger={trigger}
            t={t}
          />
        )}
      </TestWrapper>
    );

    const amountField = screen.getByTestId('mock-amount-field');
    expect(amountField).toHaveAttribute('data-submitted', 'true');
  });

  test('dovrebbe disabilitare il campo quando disabled=true', () => {
    const validationContext: BeneficiaryValidationContext<FieldValues> = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: fieldNamePrefix,
      getValues: vi.fn(),
      t: t,
      submissionCount: 0,
      creationSubmissionCount: 0
    };

    render(
      <TestWrapper>
        {({ control }) => (
          <BeneficiaryAmountFields<FieldValues>
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={true}
            fields={fields}
            validators={validators}
            trigger={trigger}
            t={t}
          />
        )}
      </TestWrapper>
    );

    const amountField = screen.getByTestId('mock-amount-field');
    expect(amountField).toHaveAttribute('data-disabled', 'true');
  });
});
