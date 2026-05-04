/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { ServiceSelector } from './ServiceSelector';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';
import { DebtTypeOrgForm } from '../../../types';

vi.mock('../../../hooks/useServiceSelectorState');

import { useServiceSelectorState } from '../../../hooks/useServiceSelectorState';
const mockUseServiceSelectorState = vi.mocked(useServiceSelectorState);

vi.mock('../../../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledSelect: ({
      name,
      label,
      options,
      disabled,
      required,
      error,
      helperText,
      placeholder
    }: any) => (
      <div data-testid="controlled-select">
        <label>{label}</label>
        <select
          name={name}
          disabled={disabled}
          required={required}
          data-error={String(error)}
        >
          <option value="">{placeholder}</option>
          {options?.map((option: any) => (
            <option key={option.value || 'none'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText && <span data-testid="helper-text">{helperText}</span>}
      </div>
    )
  }
}));

const TestWrapper = ({
  children,
  defaultValues = {}
}: {
  children: React.ReactNode;
  defaultValues?: Partial<DebtTypeOrgForm>;
}) => {
  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      notifyOutcomePushOrgSilServiceId: undefined,
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ServiceSelector', () => {
  const mockQuery = {
    data: [{ orgSilServiceId: 1, applicationName: 'Test Service' }],
    isLoading: false,
    error: null
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'test.label': 'Test Label',
      'test.config.none': 'None'
    });

    mockUseServiceSelectorState.mockReturnValue({
      options: [
        { value: 1, label: 'Test Service', description: 'https://service1.com' }
      ],
      isLoading: false,
      hasError: false,
      noOptionsAvailable: false
    });
  });

  it('renders ControlledSelect with correct props', () => {
    render(
      <TestWrapper>
        <ServiceSelector
          control={undefined as any}
          name="notifyOutcomePushOrgSilServiceId"
          labelKey="test.label"
          query={mockQuery}
          baseTranslationKey="test.config"
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('controlled-select')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    mockUseServiceSelectorState.mockReturnValue({
      options: [],
      isLoading: true,
      hasError: false,
      noOptionsAvailable: false
    });

    render(
      <TestWrapper>
        <ServiceSelector
          control={undefined as any}
          name="notifyOutcomePushOrgSilServiceId"
          labelKey="test.label"
          query={mockQuery}
          baseTranslationKey="test.config"
        />
      </TestWrapper>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('handles no options available state correctly', () => {
    mockUseServiceSelectorState.mockReturnValue({
      options: [],
      isLoading: false,
      hasError: false,
      noOptionsAvailable: true
    });

    render(
      <TestWrapper>
        <ServiceSelector
          control={undefined as any}
          name="notifyOutcomePushOrgSilServiceId"
          labelKey="test.label"
          query={mockQuery}
          baseTranslationKey="test.config"
        />
      </TestWrapper>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('handles error state correctly', () => {
    mockUseServiceSelectorState.mockReturnValue({
      options: [],
      isLoading: false,
      hasError: true,
      noOptionsAvailable: false
    });

    render(
      <TestWrapper>
        <ServiceSelector
          control={undefined as any}
          name="notifyOutcomePushOrgSilServiceId"
          labelKey="test.label"
          query={mockQuery}
          baseTranslationKey="test.config"
          required={true}
        />
      </TestWrapper>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('data-error', 'true');
    expect(select).toHaveAttribute('required');
  });
});
