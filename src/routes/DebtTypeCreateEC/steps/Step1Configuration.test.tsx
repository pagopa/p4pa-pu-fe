import { vi } from 'vitest';
import { Step1Configuration } from './Step1Configuration';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { pickSelect } from '../../../__tests__/utils';

vi.mock('../../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: () => ({
    optionsMap: [
      { value: 1, label: 'Type 1' },
      { value: 2, label: 'Type 2' },
      { value: 3, label: 'Type 3' }
    ],
    isLoading: false,
    error: null
  })
}));

describe('Step1Configuration', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required sections and fields', () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Check if main titles are rendered
    expect(
      screen.getByText('debtTypeCreateEC.configuration.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateEC.configuration.debtType.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateEC.configuration.debtTypeVersion.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateEC.configuration.selection.title')
    ).toBeInTheDocument();

    // Check for form elements
    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeCreateEC.configuration.debtType.label'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: 'debtTypeCreateEC.configuration.code.label'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: 'debtTypeCreateEC.configuration.description.label'
      })
    ).toBeInTheDocument();

    // Check for radio buttons
    expect(
      screen.getByRole('radio', {
        name: 'debtTypeCreateEC.configuration.selection.option1'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {
        name: 'debtTypeCreateEC.configuration.selection.option2'
      })
    ).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Find and click the back button
    const backButton = screen.getByRole('button', { name: 'commons.back' });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('submits form with valid data and calls onNext', async () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Select a debt type
    await pickSelect('debtTypeCreateEC.configuration.debtType.label', 'Type 2');

    // Enter values for text fields
    const codeInput = screen.getByRole('textbox', {
      name: 'debtTypeCreateEC.configuration.code.label'
    });
    fireEvent.change(codeInput, { target: { value: 'CODE123' } });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'debtTypeCreateEC.configuration.description.label'
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' }
    });

    // Select the second radio option
    const radioOption2 = screen.getByRole('radio', {
      name: 'debtTypeCreateEC.configuration.selection.option2'
    });
    fireEvent.click(radioOption2);

    // Submit the form
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtType: 2,
        code: 'CODE123',
        description: 'Test description',
        selection: 'option2'
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('updates character count for description field', () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Initially should be 0/100
    expect(screen.getByText('0/100')).toBeInTheDocument();

    // Type in the description field
    const descriptionInput = screen.getByRole('textbox', {
      name: 'debtTypeCreateEC.configuration.description.label'
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' }
    });

    // Should now show the correct count
    expect(screen.getByText('16/100')).toBeInTheDocument();
  });

  it('defaults to first radio option', () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioOption1 = screen.getByRole('radio', {
      name: 'debtTypeCreateEC.configuration.selection.option1'
    });
    const radioOption2 = screen.getByRole('radio', {
      name: 'debtTypeCreateEC.configuration.selection.option2'
    });

    // Check that first option is selected by default
    expect(radioOption1).toBeChecked();
    expect(radioOption2).not.toBeChecked();
  });

  it('allows selecting a different radio option', () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioOption1 = screen.getByRole('radio', {
      name: 'debtTypeCreateEC.configuration.selection.option1'
    });
    const radioOption2 = screen.getByRole('radio', {
      name: 'debtTypeCreateEC.configuration.selection.option2'
    });

    // Initially first option is selected
    expect(radioOption1).toBeChecked();

    // Click the second option
    fireEvent.click(radioOption2);

    // Now second option should be checked
    expect(radioOption1).not.toBeChecked();
    expect(radioOption2).toBeChecked();
  });

  it('validates required fields before submission', async () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Don't select a debt type (it's required)

    // Submit the form
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    // Validation should prevent submission
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();

    // Now select a debt type
    await pickSelect('debtTypeCreateEC.configuration.debtType.label', 'Type 1');

    // Try submitting again
    fireEvent.click(nextButton);

    // Now submission should work
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('submits form with only required fields filled', async () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Only select a debt type, leave optional fields empty
    await pickSelect('debtTypeCreateEC.configuration.debtType.label', 'Type 3');

    // Submit the form
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtType: 3,
        code: undefined,
        description: undefined,
        selection: 'option1' // Default selection
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
