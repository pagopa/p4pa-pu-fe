import { vi } from 'vitest';
import { Step3Accounting } from './Step3Accounting';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { fillField } from '../../../__tests__/utils';

describe('Step3Accounting', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all sections and fields', () => {
    render(
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Check main titles and subtitles
    expect(
      screen.getByText('debtTypeCreateEC.accounting.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateEC.accounting.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateEC.accounting.alertMessage')
    ).toBeInTheDocument();

    // Check for section titles
    expect(
      screen.getByText('debtTypeCreateEC.accounting.section.creditInfo')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateEC.accounting.section.budgetInfo')
    ).toBeInTheDocument();

    // Check for all input fields by label
    [
      'debtTypeCreateEC.accounting.postalIban',
      'debtTypeCreateEC.accounting.pspIban',
      'debtTypeCreateEC.accounting.postalAccount',
      'debtTypeCreateEC.accounting.postalAccountHolder',
      'debtTypeCreateEC.accounting.defaultBudgetStructure',
      'debtTypeCreateEC.accounting.entitySector'
    ].forEach((label) => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <Step3Accounting
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
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    fillField(
      'debtTypeCreateEC.accounting.postalIban',
      'CH9300762011623852957'
    );
    fillField('debtTypeCreateEC.accounting.pspIban', 'CH9300762011623852958');
    fillField('debtTypeCreateEC.accounting.postalAccount', '123456789');
    fillField('debtTypeCreateEC.accounting.postalAccountHolder', 'John Doe');
    fillField(
      'debtTypeCreateEC.accounting.defaultBudgetStructure',
      'Budget structure text'
    );
    fillField('debtTypeCreateEC.accounting.entitySector', 'Public Sector');

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        postalIban: 'CH9300762011623852957',
        pspIban: 'CH9300762011623852958',
        postalAccount: '123456789',
        postalAccountHolder: 'John Doe',
        defaultBudgetStructure: 'Budget structure text',
        entitySector: 'Public Sector'
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('submits form with empty optional fields', async () => {
    render(
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Submit without filling any fields (all optional)
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        postalIban: undefined,
        pspIban: undefined,
        postalAccount: undefined,
        postalAccountHolder: undefined,
        defaultBudgetStructure: undefined,
        entitySector: undefined
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });
});
