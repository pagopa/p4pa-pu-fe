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
      screen.getByText('debtTypeOrgCreate.accounting.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.accounting.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.accounting.alertMessage')
    ).toBeInTheDocument();

    // Check for section titles
    expect(
      screen.getByText('debtTypeOrgCreate.accounting.section.creditInfo')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.accounting.section.budgetInfo')
    ).toBeInTheDocument();

    // Check for all input fields by label
    [
      'debtTypeOrgCreate.accounting.postalIban',
      'debtTypeOrgCreate.accounting.pspIban',
      'debtTypeOrgCreate.accounting.postalAccount',
      'debtTypeOrgCreate.accounting.postalAccountHolder',
      'debtTypeOrgCreate.accounting.defaultBudgetStructure',
      'debtTypeOrgCreate.accounting.entitySector'
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
      'debtTypeOrgCreate.accounting.postalIban',
      'CH9300762011623852957'
    );
    fillField('debtTypeOrgCreate.accounting.pspIban', 'CH9300762011623852958');
    fillField('debtTypeOrgCreate.accounting.postalAccount', '123456789');
    fillField('debtTypeOrgCreate.accounting.postalAccountHolder', 'John Doe');
    fillField(
      'debtTypeOrgCreate.accounting.defaultBudgetStructure',
      'Budget structure text'
    );
    fillField('debtTypeOrgCreate.accounting.entitySector', 'Public Sector');

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        postalIban: 'CH9300762011623852957',
        iban: 'CH9300762011623852958',
        postalAccountCode: '123456789',
        holderPostalCc: 'John Doe',
        balance: 'Budget structure text',
        orgSector: 'Public Sector'
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
        iban: undefined,
        postalAccountCode: undefined,
        holderPostalCc: undefined,
        balance: undefined,
        orgSector: undefined
      });
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  it('shows validation error for invalid postalIban and prevents submission', async () => {
    render(
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Enter invalid postalIban
    fillField('debtTypeOrgCreate.accounting.postalIban', 'INVALID_IBAN');

    // Submit form
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    // Wait for validation error message to appear
    await waitFor(() => {
      expect(
        screen.getByText('commons.validation.invalidIban')
      ).toBeInTheDocument();
    });

    // Submission should not happen
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid iban and prevents submission', async () => {
    render(
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Enter invalid iban
    fillField('debtTypeOrgCreate.accounting.pspIban', '123');

    // Submit form
    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    // Wait for validation error message to appear
    await waitFor(() => {
      expect(
        screen.getByText('commons.validation.invalidIban')
      ).toBeInTheDocument();
    });

    // Submission should not happen
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('disables iban field when postalIban is filled', async () => {
    render(
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const postalIbanInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.accounting.postalIban'
    });
    const ibanInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.accounting.pspIban'
    });

    // Initially both enabled
    expect(postalIbanInput).toBeEnabled();
    expect(ibanInput).toBeEnabled();

    // Fill postalIban
    fireEvent.change(postalIbanInput, {
      target: { value: 'CH9300762011623852957' }
    });

    // iban input should become disabled
    await waitFor(() => {
      expect(ibanInput).toBeDisabled();
    });

    // Clear postalIban
    fireEvent.change(postalIbanInput, { target: { value: '' } });

    // iban input should become enabled again
    await waitFor(() => {
      expect(ibanInput).toBeEnabled();
    });
  });

  it('disables postalIban field when iban is filled', async () => {
    render(
      <Step3Accounting
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const postalIbanInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.accounting.postalIban'
    });
    const ibanInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.accounting.pspIban'
    });

    // Initially both enabled
    expect(postalIbanInput).toBeEnabled();
    expect(ibanInput).toBeEnabled();

    // Fill iban
    fireEvent.change(ibanInput, { target: { value: 'CH9300762011623852957' } });

    // postalIban input should become disabled
    await waitFor(() => {
      expect(postalIbanInput).toBeDisabled();
    });

    // Clear iban
    fireEvent.change(ibanInput, { target: { value: '' } });

    // postalIban input should become enabled again
    await waitFor(() => {
      expect(postalIbanInput).toBeEnabled();
    });
  });
});
