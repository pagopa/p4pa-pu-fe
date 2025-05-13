import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Step2Behaviour } from '.';

describe('Step2Behaviour', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main titles and switches', () => {
    render(
      <Step2Behaviour
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.behaviour.alertMessage')
    ).toBeInTheDocument();

    // Spontaneous payment switch
    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.behaviour.postalAccount'
      })
    ).toBeInTheDocument();

    // Notification radio group
    expect(
      screen.getByRole('radiogroup', {
        name: 'debtTypeOrgCreate.behaviour.notifications.radioLabel'
      })
    ).toBeInTheDocument();

    // Wizard step buttons
    expect(
      screen.getByRole('button', { name: 'commons.back' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.continue' })
    ).toBeInTheDocument();
  });

  it('toggles spontaneous payment section correctly', () => {
    render(
      <Step2Behaviour
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Initially, spontaneous payment disabled: behaviour section visible
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
    render(
      <Step2Behaviour
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

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
    render(
      <Step2Behaviour
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

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

  it('calls onBack when back button clicked', () => {
    render(
      <Step2Behaviour
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.back' }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('submits form and calls setData and onNext', async () => {
    render(
      <Step2Behaviour
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Enable spontaneous payment to show PaymentMethodSelector
    const spontaneousSwitch = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.postalAccount'
    });
    fireEvent.click(spontaneousSwitch);

    // Select payment method (default is FREE, so no extra input required)
    // Enable notifications "No" (default)

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
