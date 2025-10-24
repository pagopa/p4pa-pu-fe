import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '../../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { Step3Accounting } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { fillField } from '../../../../__tests__/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema } from './schema';

// Helper to render component with fresh form context per test
const renderWithForm = (
  ui: React.ReactElement,
  onSubmit?: (data: FieldValues) => void
) => {
  const Wrapper: React.FC = () => {
    const methods = useForm<FieldValues>({
      resolver: zodResolver(step3Schema),
      defaultValues: {
        postalIban: '',
        iban: '',
        postalAccountCode: '',
        holderPostalCc: '',
        balance: '',
        orgSector: ''
      }
    });

    return (
      <StoreProvider>
        <FormProvider {...methods}>
          {onSubmit ? (
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {ui}
              <button type="submit">Submit</button>
            </form>
          ) : (
            ui
          )}
        </FormProvider>
      </StoreProvider>
    );
  };

  return render(<Wrapper />);
};

describe('Step3Accounting', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();
  });

  it('renders the form with all sections and fields', () => {
    renderWithForm(<Step3Accounting />);

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

    // Check section titles
    expect(
      screen.getByText('debtTypeOrgCreate.accounting.section.creditInfo')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.accounting.section.budgetInfo')
    ).toBeInTheDocument();

    // Check all input fields by label
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

  it('submits form with valid data and calls onSubmit', async () => {
    const onSubmit = vi.fn();

    renderWithForm(<Step3Accounting />, onSubmit);

    fillField('debtTypeOrgCreate.accounting.postalIban', '123456');
    fillField(
      'debtTypeOrgCreate.accounting.pspIban',
      'IT60X0542811101000000123456'
    );
    fillField('debtTypeOrgCreate.accounting.postalAccount', '123456789');
    fillField('debtTypeOrgCreate.accounting.postalAccountHolder', 'John Doe');
    fillField(
      'debtTypeOrgCreate.accounting.defaultBudgetStructure',
      'Budget structure text'
    );
    fillField('debtTypeOrgCreate.accounting.entitySector', 'Public Sector');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          postalIban: '123456',
          iban: 'IT60X0542811101000000123456',
          postalAccountCode: '123456789',
          holderPostalCc: 'John Doe',
          balance: 'Budget structure text',
          orgSector: 'Public Sector'
        },
        expect.anything() // ignore the event argument
      );
    });
  });

  it('submits form with empty optional fields', async () => {
    const onSubmit = vi.fn();

    renderWithForm(<Step3Accounting />, onSubmit);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          postalIban: '',
          iban: '',
          postalAccountCode: '',
          holderPostalCc: '',
          balance: '',
          orgSector: ''
        },
        expect.anything() // ignore the event argument
      );
    });
  });

  it('shows validation error for invalid postalIban and prevents submission', async () => {
    const onSubmit = vi.fn();

    renderWithForm(<Step3Accounting />, onSubmit);

    fillField('debtTypeOrgCreate.accounting.postalIban', 'INVALID_IBAN');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('commons.validation.invalidPostalIban')
      ).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid iban and prevents submission', async () => {
    const onSubmit = vi.fn();

    renderWithForm(<Step3Accounting />, onSubmit);

    fillField('debtTypeOrgCreate.accounting.pspIban', '123');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('commons.validation.invalidIban')
      ).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
