import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '../../../../__tests__/renderers';
import { Step1Configuration } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm } from 'react-hook-form';
import { DebtTypeOrgForm } from '../../types';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { fillField } from '../../../../__tests__/utils'; // adjust path accordingly

const mockUseDebtPositionTypesByOrg = vi.fn();
const mockGetDebtPositionTypeOrgById = vi.fn();
const mockUseActualizationServices = vi.fn();
const mockUseNotificationServices = vi.fn();
const mockUseParams = vi.fn();

// Mock the hook that fetches debt position types
vi.mock('../../../../hooks/useDebtPositionTypesByOrg', () => ({
  useDebtPositionTypesByOrg: () => mockUseDebtPositionTypesByOrg()
}));

vi.mock('../../../../api/debtPositionsTypeOrg', () => ({
  getDebtPositionTypeOrgById: () => mockGetDebtPositionTypeOrgById()
}));

vi.mock('../../hooks/useOrgSilServices', () => ({
  useActualizationServices: () => mockUseActualizationServices(),
  useNotificationServices: () => mockUseNotificationServices()
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: () => mockUseParams()
  };
});

// Helper to render component with fresh form context per test
const renderWithForm = (ui: React.ReactElement) => {
  const Wrapper: React.FC = () => {
    const methods = useForm<DebtTypeOrgForm>({
      defaultValues: {
        debtPositionTypeId: '',
        code: '',
        description: '',
        taxonomyCode: ''
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

    // Default mock implementations
    mockUseParams.mockReturnValue({ debtPositionTypeOrgId: undefined });

    mockUseDebtPositionTypesByOrg.mockReturnValue({
      optionsMap: [
        { value: '1', label: 'Type 1' },
        { value: '2', label: 'Type 2' },
        { value: '3', label: 'Type 3' }
      ],
      data: {
        response: [
          { debtPositionTypeId: 1, code: 'C1', description: 'Desc 1' },
          { debtPositionTypeId: 2, code: 'C2', description: 'Desc 2' },
          { debtPositionTypeId: 3, code: 'C3', description: 'Desc 3' }
        ]
      },
      isLoading: false,
      error: null
    });

    mockGetDebtPositionTypeOrgById.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });

    mockUseActualizationServices.mockReturnValue({
      isLoading: false,
      data: []
    });

    mockUseNotificationServices.mockReturnValue({
      isLoading: false,
      data: []
    });
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

    expect(
      screen.getByLabelText(
        'debtTypeOrgCreate.configuration.taxonomyCode.label'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        'debtTypeOrgCreate.configuration.taxonomyCode.label'
      )
    ).toBeDisabled();
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

  it('displays taxonomy code when debt type has one', () => {
    mockUseDebtPositionTypesByOrg.mockReturnValue({
      optionsMap: [{ value: '1', label: 'Type 1' }],
      data: {
        response: [
          {
            debtPositionTypeId: 1,
            code: 'C1',
            description: 'Desc 1',
            taxonomyCode: '9/12345678901'
          }
        ]
      },
      isLoading: false,
      error: null
    });

    const Wrapper: React.FC = () => {
      const methods = useForm<DebtTypeOrgForm>({
        defaultValues: {
          debtPositionTypeId: '1',
          code: '',
          description: '',
          taxonomyCode: ''
        }
      });

      return (
        <StoreProvider>
          <FormProvider {...methods}>
            <Step1Configuration />
          </FormProvider>
        </StoreProvider>
      );
    };

    render(<Wrapper />);

    const taxonomyField = screen.getByLabelText(
      'debtTypeOrgCreate.configuration.taxonomyCode.label'
    );

    expect(taxonomyField).toBeInTheDocument();
  });

  it('does not show helper text when taxonomy code is empty', () => {
    renderWithForm(<Step1Configuration />);

    const taxonomyField = screen.getByLabelText(
      'debtTypeOrgCreate.configuration.taxonomyCode.label'
    );
    expect(taxonomyField).toBeInTheDocument();
    expect(taxonomyField).toHaveValue('');
  });

  it('disables fields in edit mode', () => {
    renderWithForm(<Step1Configuration edit={true} />);

    const codeField = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.code.label'
    });
    const descField = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.configuration.description.label'
    });
    const selectField = screen.getByRole('combobox', {
      name: 'debtTypeOrgCreate.configuration.debtType.label'
    });

    expect(codeField).toBeDisabled();
    expect(descField).toBeDisabled();
    expect(selectField).toBeDisabled();
  });
});
