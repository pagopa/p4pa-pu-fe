import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../__tests__/renderers';
import { Step2Behaviour } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from './schema';
import { PaymentMethodOption } from './components/PaymentMethodSelector';

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
        isAnonymousFiscalCode: false,
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

    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.behaviour.postalAccount'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('radiogroup', {
        name: 'debtTypeOrgCreate.behaviour.notifications.radioLabel'
      })
    ).toBeInTheDocument();
  });

  it('toggles spontaneous payment section correctly', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.section.behaviourTitle')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'debtTypeOrgCreate.behaviour.section.spontaneousPaymentTitle'
      )
    ).not.toBeInTheDocument();

    const spontaneousSwitch = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.postalAccount'
    });
    fireEvent.click(spontaneousSwitch);

    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.section.spontaneousPaymentTitle'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('debtTypeOrgCreate.behaviour.section.behaviourTitle')
    ).not.toBeInTheDocument();
  });

  it('shows correct options in behaviour section when spontaneous is disabled', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.behaviour.optionA.label debtTypeOrgCreate.behaviour.optionA.description'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.behaviour.optionB.label debtTypeOrgCreate.behaviour.optionB.description'
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

  it('disables controls in edit mode', () => {
    renderWithForm(<Step2Behaviour edit={true} />);

    const spontaneousSwitch = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.postalAccount'
    });
    expect(spontaneousSwitch).toBeDisabled();

    const optionACheckbox = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.optionA.label debtTypeOrgCreate.behaviour.optionA.description'
    });
    expect(optionACheckbox).toBeDisabled();

    const optionBCheckbox = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.optionB.label debtTypeOrgCreate.behaviour.optionB.description'
    });
    expect(optionBCheckbox).toBeDisabled();
  });

  it('shows payment method selector when spontaneous is enabled', () => {
    renderWithForm(<Step2Behaviour />, undefined, { flagSpontaneous: true });

    expect(screen.getByTestId('paymentMethod')).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', {
        name: /debtTypeOrgCreate\.behaviour\.spontaneous\.label/
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
      screen.getByText('debtTypeOrgCreate.behaviour.section.behaviourTitle')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.notifications.title')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.actualization.title')
    ).toBeInTheDocument();
  });
});
