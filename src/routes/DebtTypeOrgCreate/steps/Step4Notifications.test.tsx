import { vi } from 'vitest';
import { Step4Notifications } from './Step4Notifications';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';

describe('Step4Notifications', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with main titles and switch', () => {
    render(
      <Step4Notifications
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Check for main titles and alert message (translation keys)
    expect(
      screen.getByText('debtTypeOrgCreate.notifications.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.notifications.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.notifications.alertMessage')
    ).toBeInTheDocument();

    // Check for enableNotifications switch
    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.notifications.enableNotifications'
      })
    ).toBeInTheDocument();

    // The notification section should NOT be visible initially
    expect(
      screen.queryByText('debtTypeOrgCreate.notifications.section.message')
    ).not.toBeInTheDocument();
  });

  it('shows notification fields when enableNotifications is toggled on', () => {
    render(
      <Step4Notifications
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const switchInput = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.notifications.enableNotifications'
    });

    // Toggle switch on
    fireEvent.click(switchInput);

    // The notification section should appear
    expect(
      screen.getByText('debtTypeOrgCreate.notifications.section.message')
    ).toBeInTheDocument();

    // Check presence of required fields
    [
      'debtTypeOrgCreate.notifications.serviceApiKey.label',
      'debtTypeOrgCreate.notifications.messageSubject.label',
      'debtTypeOrgCreate.notifications.messageBody.label'
    ].forEach((label) => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });

    // Preview button should be disabled initially (empty subject/body)
    const previewButton = screen.getByRole('button', {
      name: 'debtTypeCreate.settings.preview'
    });
    expect(previewButton).toBeDisabled();
  });

  it('enables preview button only when messageSubject and messageBody have values', () => {
    render(
      <Step4Notifications
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const switchInput = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.notifications.enableNotifications'
    });
    fireEvent.click(switchInput);

    const subjectInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageSubject.label'
    });
    const bodyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageBody.label'
    });
    const previewButton = screen.getByRole('button', {
      name: 'debtTypeCreate.settings.preview'
    });

    // Initially disabled
    expect(previewButton).toBeDisabled();

    // Fill only subject
    fireEvent.change(subjectInput, { target: { value: 'Subject' } });
    expect(previewButton).toBeDisabled();

    // Fill body as well
    fireEvent.change(bodyInput, { target: { value: 'Body text' } });
    expect(previewButton).toBeEnabled();

    // Clear subject again disables preview
    fireEvent.change(subjectInput, { target: { value: '' } });
    expect(previewButton).toBeDisabled();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <Step4Notifications
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: 'commons.back' });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('validates required fields when enableNotifications is true', async () => {
    render(
      <Step4Notifications
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Enable notifications
    const switchInput = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.notifications.enableNotifications'
    });
    fireEvent.click(switchInput);

    // Submit without filling required fields
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    // Expect validation errors - the form should not submit
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();

    // Fill serviceApiKey only
    const apiKeyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.serviceApiKey.label'
    });
    fireEvent.change(apiKeyInput, { target: { value: 'apikey123' } });

    fireEvent.click(nextButton);

    // Still missing subject and body, no submit
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();

    // Fill subject and body
    const subjectInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageSubject.label'
    });
    const bodyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageBody.label'
    });
    fireEvent.change(subjectInput, { target: { value: 'Subject' } });
    fireEvent.change(bodyInput, { target: { value: 'Body text' } });

    // Submit again
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        enableNotifications: true,
        serviceApiKey: 'apikey123',
        messageSubject: 'Subject',
        messageBody: 'Body text'
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('submits form with enableNotifications false without required fields', async () => {
    render(
      <Step4Notifications
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // By default enableNotifications is false, so required fields are not needed
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        enableNotifications: false,
        serviceApiKey: '',
        messageSubject: '',
        messageBody: ''
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });
});
