import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../__tests__/renderers';
import { Step2Behaviour } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from './schema'; // Adjust path as needed

// Helper to render component with form context and validation schema
const renderWithForm = (
  ui: React.ReactElement,
  onSubmit?: (data: FieldValues) => void
) => {
  const Wrapper: React.FC = () => {
    const methods = useForm({
      resolver: zodResolver(step2Schema),
      defaultValues: {
        flagSpontaneous: false,
        flagNotifyOutcomePush: 'disable',
        paymentMethod: undefined,
        flagMandatoryDueDate: false,
        authenticateUsername: '',
        authenticatePassword: '',
        authCallbackUrl: '',
        updateCallbackUrl: ''
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

    // Initially spontaneous payment disabled: behaviour section visible
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.section.behaviourTitle')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'debtTypeOrgCreate.behaviour.section.spontaneousPaymentTitle'
      )
    ).not.toBeInTheDocument();

    // Enable spontaneous payment
    const spontaneousSwitch = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.postalAccount'
    });
    fireEvent.click(spontaneousSwitch);

    // Now spontaneous payment section visible
    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.section.spontaneousPaymentTitle'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('debtTypeOrgCreate.behaviour.section.behaviourTitle')
    ).not.toBeInTheDocument();
  });

  it('shows payment notification fields only when notifications enabled', () => {
    renderWithForm(<Step2Behaviour />);

    // Initially notifications disabled: fields hidden
    expect(
      screen.queryByText(
        'debtTypeOrgCreate.behaviour.notifications.fields.retries'
      )
    ).not.toBeInTheDocument();

    // Select "Yes" for enablePaymentNotifications
    const yesRadio = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.behaviour.notifications.options.yes'
    });
    fireEvent.click(yesRadio);

    // Now notification fields rendered
    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.notifications.fields.retries'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeOrgCreate.behaviour.notifications.fields.retries'
      })
    ).toBeInTheDocument();
  });

  it('renders update amount section with text fields', () => {
    renderWithForm(<Step2Behaviour />);

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.updateAmount.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.updateAmount.subtitle')
    ).toBeInTheDocument();

    [
      'debtTypeOrgCreate.behaviour.updateAmount.notesLabel',
      'debtTypeOrgCreate.behaviour.updateAmount.amountLabel',
      'debtTypeOrgCreate.behaviour.updateAmount.authUrlLabel',
      'debtTypeOrgCreate.behaviour.updateAmount.updateUrlLabel'
    ].forEach((label) => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });
  });
});
