import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../__tests__/renderers';
import { Step2Behaviour } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from './schema';
import { PaymentMethodOption, SpontaneousMode } from '../../types';
import type { SpontaneousForm } from '../../../../api/spontaneousForms';

const { mockGetSpontaneousForms, mockNotifyEmit } = vi.hoisted(() => ({
  mockGetSpontaneousForms: vi.fn<
    () =>
      | {
          data?: Array<SpontaneousForm>;
          isLoading: boolean;
          isError: boolean;
        }
      | undefined
  >(() => ({
    data: [
      {
        spontaneousFormId: 10,
        code: 'FORM10'
      }
    ],
    isLoading: false,
    isError: false
  })),
  mockNotifyEmit: vi.fn()
}));

vi.mock('../../hooks/useNotificationConfig', () => ({
  useNotificationConfigurations: () => ({
    isError: false,
    data: [{ id: 1, name: 'Test Config' }]
  })
}));

vi.mock('../../hooks/useActualizationConfig', () => ({
  useActualizationConfigurations: () => ({
    isError: false,
    data: [{ id: 1, name: 'Test Actualization Config' }]
  })
}));

vi.mock('../../../../utils', async () => {
  const actual =
    await vi.importActual<typeof import('../../../../utils')>(
      '../../../../utils'
    );
  return {
    ...actual,
    notify: {
      emit: mockNotifyEmit
    }
  };
});

vi.mock('../../../../api/spontaneousForms', () => ({
  getSpontaneousForms: vi.fn(() => mockGetSpontaneousForms())
}));

const renderWithForm = (
  ui: React.ReactElement,
  onSubmit?: (data: FieldValues) => void,
  defaultValues?: Partial<FieldValues>
) => {
  const Wrapper: React.FC = () => {
    const methods = useForm({
      resolver: zodResolver(step2Schema),
      defaultValues: {
        flagSpontaneous: false,
        flagNotifyOutcomePush: 'disabled',
        paymentMethod: PaymentMethodOption.FREE,
        flagMandatoryDueDate: false,
        flagAnonymousFiscalCode: false,
        ...defaultValues
      }
    });

    return (
      <StoreProvider>
        <FormProvider {...methods}>
          {onSubmit ? (
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {ui}
              <button type="submit">Submit</button>
            </form>
          ) : (
            ui
          )}
        </FormProvider>
      </StoreProvider>
    );
  };

  return render(<Wrapper />);
};

describe('Step2Behaviour', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();
  });

  it('renders main titles and controls', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.alertMessage')
    ).toBeInTheDocument();

    expect(screen.getByTestId('flagMandatoryDueDate')).toBeInTheDocument();
    expect(screen.getByTestId('flagSpontaneous')).toBeInTheDocument();

    expect(
      screen.getByRole('radiogroup', {
        name: 'debtTypeOrgCreate.behaviour.notifications.radioLabel'
      })
    ).toBeInTheDocument();
  });

  it('toggles spontaneous payment section correctly', () => {
    renderWithForm(<Step2Behaviour />);

    const spontaneousSwitch = screen.getByTestId('flagSpontaneous');
    fireEvent.click(spontaneousSwitch);

    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeOrgCreate.behaviour.spontaneousMode.label'
      })
    ).toBeInTheDocument();
  });

  it('shows notification configuration when notifications enabled', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.queryByText(
        'debtTypeOrgCreate.behaviour.notifications.fields.retries'
      )
    ).not.toBeInTheDocument();

    const yesRadio = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.behaviour.notifications.options.yes'
    });
    fireEvent.click(yesRadio);

    expect(yesRadio).toBeChecked();
  });

  it('renders actualization section', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.actualization.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.actualization.subtitle')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeOrgCreate.behaviour.actualization.configuration.label'
      })
    ).toBeInTheDocument();
  });

  it('shows spontaneous mode select when spontaneous is enabled', () => {
    renderWithForm(<Step2Behaviour />, undefined, { flagSpontaneous: true });

    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeOrgCreate.behaviour.spontaneousMode.label'
      })
    ).toBeInTheDocument();
  });

  it('handles notification service errors in edit mode', () => {
    const mockNotifyEmit = vi.fn();

    vi.doMock('../../../../utils', () => ({
      default: {
        notify: {
          emit: mockNotifyEmit
        }
      }
    }));

    vi.doMock('../../hooks/useNotificationConfig', () => ({
      useNotificationConfigurations: () => ({
        isError: true,
        data: null
      })
    }));

    renderWithForm(<Step2Behaviour edit={true} />);

    const notificationRadio = screen.getByRole('radiogroup', {
      name: 'debtTypeOrgCreate.behaviour.notifications.radioLabel'
    });
    expect(notificationRadio).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.title')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.notifications.title')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.actualization.title')
    ).toBeInTheDocument();
  });

  it('submits flagAnonymousFiscalCode set to true when toggled', async () => {
    const onSubmit = vi.fn();
    renderWithForm(<Step2Behaviour />, onSubmit);

    const anonymousSwitch = screen.getByTestId('flagAnonymousFiscalCode');
    fireEvent.click(anonymousSwitch);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await screen.findByRole('button', { name: 'Submit' });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      flagAnonymousFiscalCode: true
    });
  });

  it('shows preset amount alert and custom form select when data is available', () => {
    renderWithForm(<Step2Behaviour />, undefined, {
      flagSpontaneous: true,
      flagPresetAmount: true,
      spontaneousMode: SpontaneousMode.CUSTOM_FORM
    });

    expect(screen.getByTestId('preset-amount-info')).toBeInTheDocument();
    expect(screen.getByTestId('presetAmountValue')).toBeInTheDocument();
    expect(screen.getAllByTestId('spontaneousMode')[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('customFormId')[0]).toBeInTheDocument();
  });

  it('shows external payment url field when external url mode is selected', () => {
    renderWithForm(<Step2Behaviour />, undefined, {
      flagSpontaneous: true,
      spontaneousMode: SpontaneousMode.EXTERNAL_URL
    });

    const urlField = screen.getByTestId('externalPaymentUrl');
    expect(urlField).toBeInTheDocument();

    fireEvent.change(urlField, { target: { value: 'https://example.com' } });
    expect(urlField).toHaveValue('https://example.com');
  });

  it('shows loading state when fetching custom forms', () => {
    mockGetSpontaneousForms.mockReset();
    mockGetSpontaneousForms.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    });

    renderWithForm(<Step2Behaviour />, undefined, {
      flagSpontaneous: true,
      spontaneousMode: SpontaneousMode.CUSTOM_FORM
    });

    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === 'commons.loading';
      })
    ).toBeInTheDocument();

    mockGetSpontaneousForms.mockReset();
    mockGetSpontaneousForms.mockReturnValue({
      data: [
        {
          spontaneousFormId: 10,
          code: 'FORM10'
        }
      ],
      isLoading: false,
      isError: false
    });
  });

  it('shows empty state when no custom forms are available', () => {
    mockGetSpontaneousForms.mockReset();
    mockGetSpontaneousForms.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false
    });

    renderWithForm(<Step2Behaviour />, undefined, {
      flagSpontaneous: true,
      spontaneousMode: SpontaneousMode.CUSTOM_FORM
    });

    const messageElements = screen.getAllByText((_content, element) => {
      const text = element?.textContent || '';
      return text.includes(
        'debtTypeOrgCreate.behaviour.customForms.empty.message'
      );
    });
    expect(messageElements.length).toBeGreaterThan(0);

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.customForms.empty.action')
    ).toBeInTheDocument();

    mockGetSpontaneousForms.mockReset();
    mockGetSpontaneousForms.mockReturnValue({
      data: [
        {
          spontaneousFormId: 10,
          code: 'FORM10'
        }
      ],
      isLoading: false,
      isError: false
    });
  });
});
