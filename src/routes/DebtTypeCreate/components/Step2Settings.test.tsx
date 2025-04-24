import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Step2Settings } from './Step2Settings';
import { DebtPositionTypeRequestBody } from '../../../../generated/data-contracts';

describe('Step2Settings', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all sections', () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Check if main titles are rendered
    expect(
      screen.getByText('debtTypeCreate.settings.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreate.settings.behaviour')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreate.settings.template.title')
    ).toBeInTheDocument();

    // Check if options are rendered
    expect(
      screen.getByText(
        'debtTypeCreate.settings.flagMandatoryDueDate.description'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtTypeCreate.settings.flagAnonymousFiscalCode.description'
      )
    ).toBeInTheDocument();

    // Check if form controls are rendered
    expect(
      screen.getByText('debtTypeCreate.settings.template.checkbox')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('debtTypeCreate.settings.subject.label')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('debtTypeCreate.settings.message.label')
    ).toBeInTheDocument();
  });

  it('submits form with default values when no input is provided', async () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Click submit button
    fireEvent.click(screen.getByText('commons.create'));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        flagMandatoryDueDate: false,
        flagAnonymousFiscalCode: false,
        flagNotifyIo: undefined,
        ioTemplateSubject: '',
        ioTemplateMessage: ''
      } as DebtPositionTypeRequestBody);
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('shows validation errors when checkbox2 is checked but text fields are empty', async () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Check the checkbox2
    const checkbox = screen.getByLabelText(
      'debtTypeCreate.settings.template.checkbox'
    );
    fireEvent.click(checkbox);

    // Submit the form
    fireEvent.click(screen.getByText('commons.create'));

    await waitFor(() => {
      expect(
        screen.getByText('debtTypeCreate.settings.subject.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.settings.message.required')
      ).toBeInTheDocument();
    });

    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('successfully submits form with all fields filled when checkbox2 is checked', async () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Check all options
    const flagMandatoryDueDate = screen.getByText(
      'debtTypeCreate.settings.flagMandatoryDueDate.description'
    );
    const flagAnonymousFiscalCode = screen.getByText(
      'debtTypeCreate.settings.flagAnonymousFiscalCode.description'
    );
    fireEvent.click(flagMandatoryDueDate);
    fireEvent.click(flagAnonymousFiscalCode);

    // Check checkbox2 and fill text fields
    const checkbox2 = screen.getByText(
      'debtTypeCreate.settings.template.checkbox'
    );
    fireEvent.click(checkbox2);

    const textField = screen.getByRole('textbox', {
      name: 'debtTypeCreate.settings.subject.label'
    });
    fireEvent.change(textField, { target: { value: 'Subject text' } });

    const textArea = screen.getByRole('textbox', {
      name: 'debtTypeCreate.settings.message.label'
    });
    fireEvent.change(textArea, { target: { value: 'Message content' } });

    // Submit the form
    fireEvent.click(screen.getByText('commons.create'));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        flagMandatoryDueDate: true,
        flagAnonymousFiscalCode: true,
        flagNotifyIo: true,
        ioTemplateSubject: 'Subject text',
        ioTemplateMessage: 'Message content'
      } as DebtPositionTypeRequestBody);
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('does not apply validation to text fields when checkbox2 is unchecked', async () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Text fields should not be required when checkbox2 is unchecked
    const checkbox2 = screen.getByLabelText(
      'debtTypeCreate.settings.template.checkbox'
    );
    expect(checkbox2).not.toBeChecked();

    // Submit the form
    fireEvent.click(screen.getByText('commons.create'));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        flagMandatoryDueDate: false,
        flagAnonymousFiscalCode: false,
        flagNotifyIo: undefined,
        ioTemplateSubject: '',
        ioTemplateMessage: ''
      } as DebtPositionTypeRequestBody);
      expect(mockOnNext).toHaveBeenCalled();
    });

    // No validation errors should be shown
    expect(
      screen.queryByText('debtTypeCreate.settings.subject.required')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('debtTypeCreate.settings.message.required')
    ).not.toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Find and click the back button
    const backButton = screen.getByRole('button', { name: 'commons.back' });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('displays preview link', () => {
    render(
      <Step2Settings
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(
      screen.getByText('debtTypeCreate.settings.preview')
    ).toBeInTheDocument();
  });
});
