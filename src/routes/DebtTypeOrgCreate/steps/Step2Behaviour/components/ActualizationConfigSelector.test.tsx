/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { ActualizationConfigSelector } from './ActualizationConfigSelector';
import { DebtTypeOrgForm } from '../../../types';
import { useActualizationServices } from '../../../hooks/useOrgSilServices';

vi.mock('../../../hooks/useOrgSilServices', () => ({
  useActualizationServices: vi.fn()
}));

vi.mock('./ServiceSelector', () => ({
  ServiceSelector: ({
    name,
    labelKey,
    required,
    baseTranslationKey,
    query,
    control
  }: any) => (
    <div data-testid="service-selector">
      <span data-testid="name">{name}</span>
      <span data-testid="label-key">{labelKey}</span>
      <span data-testid="required">{String(required)}</span>
      <span data-testid="base-translation-key">{baseTranslationKey}</span>
      <span data-testid="has-query">{query ? 'true' : 'false'}</span>
      <span data-testid="has-control">{control ? 'true' : 'false'}</span>
    </div>
  )
}));

const mockUseActualizationServices = vi.mocked(useActualizationServices);

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      amountActualizationOrgSilServiceId: undefined
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ActualizationConfigSelector', () => {
  const mockQuery = {
    data: [{ orgSilServiceId: 1, applicationName: 'Test Service' }],
    isLoading: false,
    isError: false,
    error: null,
    status: 'success' as const,
    isSuccess: true,
    isFetching: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseActualizationServices.mockReturnValue(mockQuery as any);
  });

  it('renders ServiceSelector with correct props', () => {
    render(
      <TestWrapper>
        <ActualizationConfigSelector control={undefined as any} />
      </TestWrapper>
    );

    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
    expect(screen.getByTestId('name')).toHaveTextContent(
      'amountActualizationOrgSilServiceId'
    );
    expect(screen.getByTestId('label-key')).toHaveTextContent(
      'debtTypeOrgCreate.behaviour.actualization.configuration.label'
    );
    expect(screen.getByTestId('required')).toHaveTextContent('false');
    expect(screen.getByTestId('base-translation-key')).toHaveTextContent(
      'debtTypeOrgCreate.behaviour.actualization.configuration'
    );
  });

  it('calls useActualizationServices hook', () => {
    render(
      <TestWrapper>
        <ActualizationConfigSelector control={undefined as any} />
      </TestWrapper>
    );

    expect(mockUseActualizationServices).toHaveBeenCalled();
  });

  it('passes query result to ServiceSelector', () => {
    render(
      <TestWrapper>
        <ActualizationConfigSelector control={undefined as any} />
      </TestWrapper>
    );

    expect(screen.getByTestId('has-query')).toHaveTextContent('true');
  });

  it('passes control prop to ServiceSelector', () => {
    const mockControl = {} as any;

    render(
      <TestWrapper>
        <ActualizationConfigSelector control={mockControl} />
      </TestWrapper>
    );

    expect(screen.getByTestId('has-control')).toHaveTextContent('true');
  });

  it('passes query to ServiceSelector when loading', () => {
    mockUseActualizationServices.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      status: 'loading',
      isSuccess: false,
      isFetching: true
    } as any);

    render(
      <TestWrapper>
        <ActualizationConfigSelector control={undefined as any} />
      </TestWrapper>
    );

    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
    expect(screen.getByTestId('has-query')).toHaveTextContent('true');
  });

  it('passes query to ServiceSelector when error occurs', () => {
    mockUseActualizationServices.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('API Error'),
      status: 'error',
      isSuccess: false,
      isFetching: false
    } as any);

    render(
      <TestWrapper>
        <ActualizationConfigSelector control={undefined as any} />
      </TestWrapper>
    );

    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
    expect(screen.getByTestId('has-query')).toHaveTextContent('true');
  });

  it('passes query to ServiceSelector with empty data', () => {
    mockUseActualizationServices.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      isSuccess: true,
      isFetching: false
    } as any);

    render(
      <TestWrapper>
        <ActualizationConfigSelector control={undefined as any} />
      </TestWrapper>
    );

    expect(screen.getByTestId('service-selector')).toBeInTheDocument();
    expect(screen.getByTestId('has-query')).toHaveTextContent('true');
  });
});
