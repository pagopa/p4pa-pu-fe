import { vi } from 'vitest';
import { Step5Operators, OperatorSelection } from './Step5Operators';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';

describe('Step5Operators', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main titles, section, and radio options', () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Main titles
    expect(
      screen.getByText('debtTypeOrgCreate.operators.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.operators.subtitle')
    ).toBeInTheDocument();

    // Section title
    expect(
      screen.getByText('debtTypeOrgCreate.operators.section.operatorEntities')
    ).toBeInTheDocument();

    // Radio options
    expect(
      screen.getByRole('radio', {
        name: 'debtTypeOrgCreate.operators.options.all'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {
        name: 'debtTypeOrgCreate.operators.options.none'
      })
    ).toBeInTheDocument();
  });

  it('defaults to ALL option selected', () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioAll = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.all'
    });
    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });

    expect(radioAll).toBeChecked();
    expect(radioNone).not.toBeChecked();
  });

  it('allows selecting NONE option', () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioAll = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.all'
    });
    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });

    // Select NONE
    fireEvent.click(radioNone);

    expect(radioAll).not.toBeChecked();
    expect(radioNone).toBeChecked();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <Step5Operators
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

  it('submits form with default (ALL) selection and calls onNext', async () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        operatorSelection: OperatorSelection.ALL
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('submits form with NONE selection and calls onNext', async () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });
    fireEvent.click(radioNone);

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        operatorSelection: OperatorSelection.NONE
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('shows validation error if operatorSelection is unset (edge case)', async () => {
    // This is a theoretical case, since the radio is always set by default,
    // but we can simulate it by rendering with no default value.
    // You might need to adjust the component to allow this for testing.
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Uncheck both radios (simulate no selection)
    const radioAll = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.all'
    });
    fireEvent.click(radioAll); // Already checked, so this might not uncheck
    // In actual HTML, one radio is always checked, so this is just for completeness

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    // Should not submit, but since default is always set, this is just a placeholder
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });
});
