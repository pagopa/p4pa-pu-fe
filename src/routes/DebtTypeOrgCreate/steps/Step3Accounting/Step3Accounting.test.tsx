import { vi } from 'vitest';
import { render, screen } from '../../../../__tests__/renderers';
import { Step3Accounting } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm } from 'react-hook-form';
import { DebtTypeOrgForm } from '../../types';

vi.mock('./components/BudgetItems', () => ({
  BudgetItems: ({ edit }: { edit?: boolean }) => (
    <div data-testid="budget-items" data-edit={edit}>
      BudgetItems
    </div>
  )
}));

const renderWithForm = (edit?: boolean) => {
  const Wrapper = () => {
    const methods = useForm<DebtTypeOrgForm>();

    return (
      <StoreProvider>
        <FormProvider {...methods}>
          <Step3Accounting edit={edit} />
        </FormProvider>
      </StoreProvider>
    );
  };

  return render(<Wrapper />);
};

describe('Step3Accounting', () => {
  it('renders the accounting sections and fields', () => {
    renderWithForm();

    expect(
      screen.getByText('debtTypeOrgCreate.accounting.title')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.accounting.subtitle')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.accounting.alertMessage')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.accounting.section.creditInfo')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtTypeOrgCreate.accounting.section.budgetInfo')
    ).toBeInTheDocument();

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

  it('renders BudgetItems', () => {
    renderWithForm();

    expect(screen.getByTestId('budget-items')).toBeInTheDocument();
  });

  it('passes edit=true to BudgetItems', () => {
    renderWithForm(true);

    expect(screen.getByTestId('budget-items')).toHaveAttribute(
      'data-edit',
      'true'
    );
  });
});
