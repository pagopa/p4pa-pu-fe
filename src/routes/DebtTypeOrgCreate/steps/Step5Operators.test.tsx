import { vi } from 'vitest';
import { Step5Operators } from './Step5Operators';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { OperatorsSelection } from '../../../../generated/data-contracts';

const mockApiResponse = {
  content: [
    {
      operatorId: 'op1',
      mappedExternalUserId: 'ext1',
      firstName: 'John',
      lastName: 'Doe',
      enabled: true
    },
    {
      operatorId: 'op2',
      mappedExternalUserId: 'ext2',
      firstName: 'Jane',
      lastName: 'Smith',
      enabled: false
    }
  ],
  totalPages: 1,
  number: 0,
  size: 10
};

vi.mock('../../../api/debtPositionTypeOrgOperators', () => ({
  getDebtPositionTypeOrgOperators: vi.fn(() => ({
    data: mockApiResponse,
    isLoading: false,
    error: null
  }))
}));

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

    expect(
      screen.getByText('debtTypeOrgCreate.operators.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.operators.subtitle')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.operators.section.operatorEntities')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('radio', {
        name: 'debtTypeOrgCreate.operators.options.all'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {
        name: 'debtTypeOrgCreate.operators.options.selected'
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

    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });

    fireEvent.click(radioNone);

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
        operatorsSelection: OperatorsSelection.ALL,
        enabledOperators: []
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
        operatorsSelection: OperatorsSelection.NONE,
        enabledOperators: []
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('displays OperatorSelector when SELECTED option is chosen', async () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioSelected = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.selected'
    });
    fireEvent.click(radioSelected);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('submits form with selected operators when SELECTED option is chosen', async () => {
    render(
      <Step5Operators
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const radioSelected = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.selected'
    });
    fireEvent.click(radioSelected);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        operatorsSelection: OperatorsSelection.SELECTED,
        enabledOperators: ['ext1']
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });
});
