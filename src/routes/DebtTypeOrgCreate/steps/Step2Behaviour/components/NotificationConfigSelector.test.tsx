/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sonarjs/no-nested-conditional */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { NotificationConfigSelector } from './NotificationConfigSelector';
import { setOrganizationId } from '../../../../../store/OrganizationIdStore';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';
import { DebtTypeOrgForm } from '../../../types';

vi.mock('../../../hooks/useOrgSilServices', () => ({
  useNotificationServices: vi.fn()
}));

import { useNotificationServices } from '../../../hooks/useOrgSilServices';
const mockUseNotificationServices = vi.mocked(useNotificationServices);

vi.mock('./ServiceSelector', () => ({
  ServiceSelector: ({ name, labelKey, required }: any) => (
    <div data-testid="service-selector">
      <span>ServiceSelector</span>
      <span>name: {name}</span>
      <span>labelKey: {labelKey}</span>
      <span>required: {String(required)}</span>
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
      notifyOutcomePushOrgSilServiceId: undefined,
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('NotificationConfigSelector', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();

    i18nTestSetup({
      'debtTypeOrgCreate.behaviour.notifications.configuration.label':
        'Notification Label',
      'debtTypeOrgCreate.behaviour.notifications.configuration.none':
        'None Selected'
    });

    mockUseNotificationServices.mockReturnValue({
      data: [{ orgSilServiceId: 1, applicationName: 'Notification Service' }],
      isLoading: false,
      isError: false,
      error: null,
      status: 'success',
      isSuccess: true,
      isFetching: false
    } as any);
  });

  describe('Create Mode', () => {
    it('renders ServiceSelector in create mode', () => {
      render(
        <TestWrapper>
          <NotificationConfigSelector control={undefined as any} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
      expect(
        screen.getByText('name: notifyOutcomePushOrgSilServiceId')
      ).toBeInTheDocument();
      expect(screen.getByText('required: true')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders read-only TextField when currentValue is 0 in edit mode', () => {
      render(
        <TestWrapper defaultValues={{ notifyOutcomePushOrgSilServiceId: 0 }}>
          <NotificationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue('None Selected')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('renders ServiceSelector when has valid current value in edit mode', () => {
      render(
        <TestWrapper defaultValues={{ notifyOutcomePushOrgSilServiceId: 123 }}>
          <NotificationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
      expect(screen.getByText('required: true')).toBeInTheDocument();
    });

    it('renders ServiceSelector when currentValue is undefined in edit mode', () => {
      render(
        <TestWrapper
          defaultValues={{ notifyOutcomePushOrgSilServiceId: undefined }}
        >
          <NotificationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
    });

    it('renders ServiceSelector when currentValue is null in edit mode', () => {
      render(
        <TestWrapper
          defaultValues={{ notifyOutcomePushOrgSilServiceId: null as any }}
        >
          <NotificationConfigSelector control={undefined as any} edit={true} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
    });

    it('only shows read-only TextField specifically when currentValue is exactly 0', () => {
      const testCases = [
        { value: 0, shouldShowTextField: true, description: 'exactly 0' },
        {
          value: 1,
          shouldShowTextField: false,
          description: 'positive number'
        },
        {
          value: -1,
          shouldShowTextField: false,
          description: 'negative number'
        },
        {
          value: undefined,
          shouldShowTextField: false,
          description: 'undefined'
        },
        { value: null, shouldShowTextField: false, description: 'null' }
      ];

      testCases.forEach(({ value, shouldShowTextField }) => {
        const { unmount } = render(
          <TestWrapper
            defaultValues={{ notifyOutcomePushOrgSilServiceId: value as any }}
          >
            <NotificationConfigSelector
              control={undefined as any}
              edit={true}
            />
          </TestWrapper>
        );

        if (shouldShowTextField) {
          expect(screen.getByDisplayValue('None Selected')).toBeInTheDocument();
          expect(
            screen.queryByTestId('service-selector')
          ).not.toBeInTheDocument();
        } else {
          expect(screen.getByTestId('service-selector')).toBeInTheDocument();
          expect(
            screen.queryByDisplayValue('None Selected')
          ).not.toBeInTheDocument();
        }

        unmount();
      });
    });
  });

  describe('Query States', () => {
    it('passes query to ServiceSelector regardless of query state', () => {
      mockUseNotificationServices.mockReturnValue({
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
          <NotificationConfigSelector control={undefined as any} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
    });

    it('passes query to ServiceSelector when loading', () => {
      mockUseNotificationServices.mockReturnValue({
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
          <NotificationConfigSelector control={undefined as any} />
        </TestWrapper>
      );

      const serviceSelector = screen.getByTestId('service-selector');
      expect(serviceSelector).toBeInTheDocument();
    });

    it('handles all query combinations in edit mode with non-zero value', () => {
      const queryStates = [
        { isLoading: true, isError: false, data: null },
        { isLoading: false, isError: true, data: null },
        { isLoading: false, isError: false, data: [] },
        {
          isLoading: false,
          isError: false,
          data: [{ orgSilServiceId: 1, applicationName: 'Service' }]
        }
      ];

      queryStates.forEach((queryState, _index) => {
        mockUseNotificationServices.mockReturnValue({
          ...queryState,
          error: queryState.isError ? new Error('Test Error') : null,
          status: queryState.isLoading
            ? 'loading'
            : queryState.isError
              ? 'error'
              : 'success',
          isSuccess: !queryState.isLoading && !queryState.isError,
          isFetching: queryState.isLoading
        } as any);

        const { unmount } = render(
          <TestWrapper defaultValues={{ notifyOutcomePushOrgSilServiceId: 5 }}>
            <NotificationConfigSelector
              control={undefined as any}
              edit={true}
            />
          </TestWrapper>
        );

        expect(screen.getByTestId('service-selector')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
