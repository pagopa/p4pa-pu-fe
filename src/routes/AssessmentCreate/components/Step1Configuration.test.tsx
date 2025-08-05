/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../../store/GlobalStore';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { Step1Configuration } from './Step1Configuration';
import { render } from '../../../__tests__/renderers';

vi.mock('../../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: vi.fn()
}));

vi.mock('../../../store/GlobalStore', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../store/GlobalStore')>();
  return {
    ...actual,
    useStore: vi.fn()
  };
});

vi.mock('../../../components/Wizard/SectionBox', () => ({
  default: ({ title, children, 'data-testid': testId }: any) => (
    <div data-testid={testId}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}));

vi.mock('../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({ title, children }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

vi.mock('../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledTextField: ({
      label,
      name,
      placeholder,
      disabled,
      'data-testid': testId
    }: any) => (
      <div data-testid={testId}>
        <label>{label}</label>
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          data-testid={`${testId}-input`}
        />
      </div>
    ),
    ControlledSelect: ({
      label,
      name,
      options,
      disabled,
      placeholder,
      'data-testid': testId
    }: any) => (
      <div data-testid={testId}>
        <label>{label}</label>
        <select
          name={name}
          disabled={disabled}
          data-testid={`${testId}-select`}
        >
          <option value="">{placeholder}</option>
          {options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
}));

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      assessmentName: '',
      debtPositionTypeOrgCode: ''
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithForm = (component: React.ReactNode) => {
  return render(<FormWrapper>{component}</FormWrapper>);
};

describe('Step1Configuration', () => {
  const mockUseDebtPositionsTypeOrg = useDebtPositionsTypeOrg as Mock;
  const mockUseStore = useStore as Mock;

  const translations = {
    'assessmentCreate.configuration.title': 'Configurazione Assessment',
    'assessmentCreate.configuration.step1.title': 'Informazioni Base',
    'assessmentCreate.configuration.step1.fields.name.label': 'Nome Assessment',
    'assessmentCreate.configuration.step1.fields.name.placeholder':
      'Inserisci il nome',
    'assessmentCreate.configuration.step1.fields.debtPositionType.label':
      'Tipo Posizione Debitoria',
    'assessmentCreate.configuration.step1.fields.debtPositionType.placeholder':
      'Seleziona tipo'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);

    mockUseStore.mockReturnValue({
      state: {
        organizationId: 'test-org-123'
      }
    });

    mockUseDebtPositionsTypeOrg.mockReturnValue({
      optionsMap: [
        { value: 'TYPE_1', label: 'Tipo 1' },
        { value: 'TYPE_2', label: 'Tipo 2' }
      ]
    });
  });

  describe('Rendering', () => {
    it('should render step title and section title', () => {
      renderWithForm(<Step1Configuration />);

      expect(screen.getByText('Configurazione Assessment')).toBeInTheDocument();
      expect(screen.getByText('Informazioni Base')).toBeInTheDocument();
    });

    it('should render assessment name field', () => {
      renderWithForm(<Step1Configuration />);

      expect(screen.getByText('Nome Assessment')).toBeInTheDocument();
      expect(screen.getByTestId('assessmentName-input')).toBeInTheDocument();
      expect(screen.getByTestId('assessmentName-input')).toHaveAttribute(
        'placeholder',
        'Inserisci il nome'
      );
    });

    it('should render debt position type field', () => {
      renderWithForm(<Step1Configuration />);

      expect(screen.getByText('Tipo Posizione Debitoria')).toBeInTheDocument();
      expect(
        screen.getByTestId('debtPositionTypeOrgCode-select')
      ).toBeInTheDocument();
    });

    it('should render debt position type options', () => {
      renderWithForm(<Step1Configuration />);

      expect(screen.getByText('Seleziona tipo')).toBeInTheDocument();
      expect(screen.getByText('Tipo 1')).toBeInTheDocument();
      expect(screen.getByText('Tipo 2')).toBeInTheDocument();
    });
  });

  describe('Disabled states', () => {
    it('should disable fields when editmode is true', () => {
      renderWithForm(<Step1Configuration editmode={true} />);

      expect(screen.getByTestId('assessmentName-input')).toBeDisabled();
      expect(
        screen.getByTestId('debtPositionTypeOrgCode-select')
      ).toBeDisabled();
    });

    it('should disable fields when isLoading is true', () => {
      renderWithForm(<Step1Configuration isLoading={true} />);

      expect(screen.getByTestId('assessmentName-input')).toBeDisabled();
      expect(
        screen.getByTestId('debtPositionTypeOrgCode-select')
      ).toBeDisabled();
    });

    it('should disable debt position type when no options available', () => {
      mockUseDebtPositionsTypeOrg.mockReturnValue({
        optionsMap: []
      });

      renderWithForm(<Step1Configuration />);

      expect(screen.getByTestId('assessmentName-input')).not.toBeDisabled();
      expect(
        screen.getByTestId('debtPositionTypeOrgCode-select')
      ).toBeDisabled();
    });

    it('should disable debt position type when optionsMap is undefined', () => {
      mockUseDebtPositionsTypeOrg.mockReturnValue({
        optionsMap: undefined
      });

      renderWithForm(<Step1Configuration />);

      expect(
        screen.getByTestId('debtPositionTypeOrgCode-select')
      ).toBeDisabled();
    });
  });

  describe('Hook integration', () => {
    it('should call useDebtPositionsTypeOrg with correct parameters', () => {
      renderWithForm(<Step1Configuration />);

      expect(mockUseDebtPositionsTypeOrg).toHaveBeenCalledWith({
        organizationId: 'test-org-123',
        includeAllOption: false,
        useCodeAsValue: true,
        filterActiveOnly: true
      });
    });

    it('should use organizationId from store', () => {
      renderWithForm(<Step1Configuration />);

      expect(mockUseStore).toHaveBeenCalled();
      expect(mockUseDebtPositionsTypeOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'test-org-123',
          filterActiveOnly: true
        })
      );
    });
  });

  describe('Props behavior', () => {
    it('should handle default props', () => {
      renderWithForm(<Step1Configuration />);

      expect(screen.getByTestId('assessmentName-input')).not.toBeDisabled();
    });

    it('should handle editmode and isLoading together', () => {
      renderWithForm(<Step1Configuration editmode={true} isLoading={true} />);

      expect(screen.getByTestId('assessmentName-input')).toBeDisabled();
      expect(
        screen.getByTestId('debtPositionTypeOrgCode-select')
      ).toBeDisabled();
    });
  });

  describe('Data testids', () => {
    it('should have correct data-testid attributes', () => {
      renderWithForm(<Step1Configuration />);

      expect(
        screen.getByTestId('step1-configuration-assessment')
      ).toBeInTheDocument();
      expect(screen.getByTestId('assessmentName')).toBeInTheDocument();
      expect(screen.getByTestId('debtPositionTypeOrgCode')).toBeInTheDocument();
    });
  });
});
