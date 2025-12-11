import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '../../../../__tests__/renderers';
import { Step1Configuration } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm } from 'react-hook-form';
import { DebtTypeOrgForm } from '../../types';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { fillField } from '../../../../__tests__/utils'; // adjust path accordingly

// Mock the hook that fetches debt position types
vi.mock('../../../../hooks/useDebtPositionTypesByOrg', () => ({
  useDebtPositionTypesByOrg: () => ({
    optionsMap: [
      { value: '1', label: 'Type 1' },
      { value: '2', label: 'Type 2' },
      { value: '3', label: 'Type 3' }
    ],
    data: [
      { debtPositionTypeId: 1, code: 'C1', description: 'Desc 1' },
      { debtPositionTypeId: 2, code: 'C2', description: 'Desc 2' },
      { debtPositionTypeId: 3, code: 'C3', description: 'Desc 3' }
    ],
    isLoading: false,
    error: null
  })
}));

// Helper to render component with fresh form context per test
const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper: React.FC = () => {
    const methods = useForm<DebtTypeOrgForm>({
      defaultValues: {
        debtPositionTypeId: '',
        code: '',
        description: ''
      }
    });

    return (
      <StoreProvider>
        <FormProvider {...methods}>{ui}</FormProvider>
      </StoreProvider>
    );
  };

  return render(<Wrapper />);
};

describe('Step1Configuration', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();
  });

  it('renders the form with all required sections and fields', () => {
    renderWithForm(<Step1Configuration />);

    expect(
      screen.getByText('debtTypeOrgCreate.configuration.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.configuration.debtType.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.configuration.debtTypeVersion.title')
    ).toBeInTheDocument();

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

  it('updates character count for description field', () => {
    renderWithForm(<Step1Configuration />);

    expect(screen.getByText('0/200')).toBeInTheDocument();

    fillField(
      'debtTypeOrgCreate.configuration.description.label',
      'Test description'
    );

    expect(screen.getByText('16/200')).toBeInTheDocument();
  });
});
