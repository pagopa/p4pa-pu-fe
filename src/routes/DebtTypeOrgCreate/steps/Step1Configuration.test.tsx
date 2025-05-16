import { vi } from 'vitest';
import { Step1Configuration } from './Step1Configuration';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { pickSelect } from '../../../__tests__/utils';

vi.mock('../../../hooks/useDebtPositionTypesByOrg', () => ({
  useDebtPositionTypesByOrg: () => ({
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

    // Check main titles
    expect(
      screen.getByText('debtTypeOrgCreate.configuration.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.configuration.debtType.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.configuration.debtTypeVersion.title')
    ).toBeInTheDocument();

    // Check form controls
    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeOrgCreate.configuration.debtType.label'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', {
        name: 'debtTypeOrgCreate.configuration.code.label'
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', {
        name: 'debtTypeOrgCreate.configuration.description.label'
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
    await pickSelect(
      'debtTypeOrgCreate.configuration.debtType.label',
      'Type 2'
    );

    // Enter values for text fields
    const codeInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.code.label'
    });
    fireEvent.change(codeInput, { target: { value: 'CODE123' } });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.description.label'
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' }
    });

    // Submit the form
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtPositionTypeId: 2,
        code: 'CODE123',
        description: 'Test description'
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

    expect(screen.getByText('0/100')).toBeInTheDocument();

    const descriptionInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.description.label'
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' }
    });

    expect(screen.getByText('16/100')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Submit without selecting debtPositionTypeId (required)
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();

    // Now select a debt type and submit again
    await pickSelect(
      'debtTypeOrgCreate.configuration.debtType.label',
      'Type 1'
    );

    // Fill code and description (both required)
    const codeInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.code.label'
    });
    fireEvent.change(codeInput, { target: { value: 'CODE1' } });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.description.label'
    });
    fireEvent.change(descriptionInput, { target: { value: 'Desc' } });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('does not submit if required fields are missing', async () => {
    render(
      <Step1Configuration
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Select debt type only, but no code or description
    await pickSelect(
      'debtTypeOrgCreate.configuration.debtType.label',
      'Type 3'
    );

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    // Should not submit because code and description are required
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });
});
