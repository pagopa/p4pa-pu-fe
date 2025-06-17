/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { ActualizationConfigSelector } from './ActualizationConfigSelector';
import { setOrganizationId } from '../../../../../store/OrganizationIdStore';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';
import { DebtTypeOrgForm } from '../../../types';

vi.mock('../../../hooks/useOrgSilServices', () => ({
  useActualizationServices: vi.fn()
}));

import { useActualizationServices } from '../../../hooks/useOrgSilServices';
const mockUseActualizationServices = vi.mocked(useActualizationServices);

vi.mock('./ServiceSelector', () => ({
  ServiceSelector: ({ name, labelKey, required, allowNone }: any) => (
    <div data-testid="service-selector">
      <span>ServiceSelector</span>
      <span>name: {name}</span>
      <span>labelKey: {labelKey}</span>
      <span>required: {String(required)}</span>
      <span>allowNone: {String(allowNone)}</span>
    </div>
  )
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
      amountActualizationOrgSilServiceId: undefined,
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ActualizationConfigSelector', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();

    i18nTestSetup({
      'debtTypeOrgCreate.behaviour.actualization.configuration.label':
        'Configuration Label',
      'debtTypeOrgCreate.behaviour.actualization.configuration.noneSelected':
        'None Selected',
      'debtTypeOrgCreate.behaviour.actualization.configuration.noneEditHelper':
        'Edit Helper Text'
    });

    // Fix: Return structure should match React Query structure
    mockUseActualizationServices.mockReturnValue({
      data: [{ orgSilServiceId: 1, applicationName: 'Test Service' }],
      isLoading: false,
      isError: false,
      error: null,
      // Add other React Query properties that might be accessed
      status: 'success',
      isSuccess: true,
      isFetching: false
    } as any);
  });

  describe('Create Mode', () => {
    it('renders ServiceSelector with allowNone=true in create mode', () => {
      render(
        <TestWrapper>
          <ActualizationConfigSelector control={undefined as any} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
      expect(
        screen.getByText('name: amountActualizationOrgSilServiceId')
      ).toBeInTheDocument();
      expect(screen.getByText('required: false')).toBeInTheDocument();
      expect(screen.getByText('allowNone: true')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders read-only TextField when no current value in edit mode', () => {
      render(
        <TestWrapper
          defaultValues={{ amountActualizationOrgSilServiceId: undefined }}
        >
          <ActualizationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue('None Selected')).toBeInTheDocument();
      expect(screen.getByText('Edit Helper Text')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('renders ServiceSelector when has current value in edit mode', () => {
      render(
        <TestWrapper
          defaultValues={{ amountActualizationOrgSilServiceId: 123 }}
        >
          <ActualizationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
      expect(screen.getByText('allowNone: false')).toBeInTheDocument();
      expect(screen.getByText('required: false')).toBeInTheDocument();
    });

    it('handles undefined and null values correctly in edit mode', () => {
      const testCases = [undefined, null];

      testCases.forEach((value) => {
        const { unmount } = render(
          <TestWrapper
            defaultValues={{ amountActualizationOrgSilServiceId: value as any }}
          >
            <ActualizationConfigSelector
              control={undefined as any}
              edit={true}
            />
          </TestWrapper>
        );

        expect(screen.getByDisplayValue('None Selected')).toBeInTheDocument();
        unmount();
      });
    });

    it('renders ServiceSelector when current value is greater than 0 in edit mode', () => {
      render(
        <TestWrapper defaultValues={{ amountActualizationOrgSilServiceId: 5 }}>
          <ActualizationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
      expect(screen.getByText('allowNone: false')).toBeInTheDocument();
    });

    // Fix: Test that 0 is treated as "no value" and shows read-only field
    it('treats 0 as no value in edit mode (shows read-only field)', () => {
      render(
        <TestWrapper defaultValues={{ amountActualizationOrgSilServiceId: 0 }}>
          <ActualizationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      // 0 should show read-only field, same as undefined/null
      expect(screen.getByDisplayValue('None Selected')).toBeInTheDocument();
      expect(screen.getByText('Edit Helper Text')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(screen.queryByTestId('service-selector')).not.toBeInTheDocument();
    });

    it('treats positive numbers as valid values in edit mode', () => {
      render(
        <TestWrapper defaultValues={{ amountActualizationOrgSilServiceId: 1 }}>
          <ActualizationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      // Positive numbers should show ServiceSelector
      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue('None Selected')
      ).not.toBeInTheDocument();
    });
  });

  describe('Query States', () => {
    it('passes query to ServiceSelector regardless of query state', () => {
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

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
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

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
    });
  });
});
