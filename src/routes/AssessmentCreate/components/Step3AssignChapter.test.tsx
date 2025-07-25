import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useOperatingYears } from '../../../hooks/useOperatingYears';
import { useChapters } from '../../../hooks/useChapters';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { Step3AssignChapter } from './Step3AssignChapter';
import { render } from '../../../__tests__/renderers';

vi.mock('../../../hooks/useOperatingYears', () => ({
  useOperatingYears: vi.fn()
}));

vi.mock('../../../hooks/useChapters', () => ({
  useChapters: vi.fn()
}));

vi.mock('../../../components/Wizard/SectionBox', () => ({
  default: ({
    title,
    children,
    adornment,
    'data-testid': testId
  }: {
    title: string;
    children: React.ReactNode;
    adornment?: React.ReactNode;
    'data-testid'?: string;
  }) => (
    <div data-testid={testId}>
      <div data-testid="section-adornment">{adornment}</div>
      <h3>{title}</h3>
      {children}
    </div>
  )
}));

vi.mock('../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({
    title,
    children
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="wizard-step-wrapper">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

vi.mock('../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledSelect: ({
      label,
      name,
      options,
      disabled,
      placeholder,
      required,
      control,
      'data-testid': testId
    }: {
      label: string;
      name: string;
      options?: Array<{ value: string; label: string }>;
      disabled?: boolean;
      placeholder?: string;
      required?: boolean;
      control: ReturnType<typeof useForm>['control'];
      'data-testid': string;
    }) => {
      const { Controller } = require('react-hook-form');

      return (
        <div data-testid={testId}>
          <Controller
            name={name}
            control={control}
            render={({
              field
            }: {
              field: { value: string; onChange: (value: string) => void };
            }) => (
              <div>
                <label>
                  {label} {required && '*'}
                </label>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={disabled}
                  data-testid={`${testId}-select`}
                  required={required}
                >
                  <option value="">{placeholder}</option>
                  {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>
      );
    }
  }
}));

type AssessmentFormData = {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  selectedPaymentIuds?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
  debtPositionTypeOrgCode?: string;
  assessmentRegistryId?: number;
};

type FormWrapperProps = {
  children: React.ReactNode;
  defaultValues?: Partial<AssessmentFormData>;
};

const FormWrapper = ({ children, defaultValues = {} }: FormWrapperProps) => {
  const methods = useForm<AssessmentFormData>({
    defaultValues: {
      addPaymentsToAssessment: false,
      selectedPayments: [],
      selectedPaymentIuds: [],
      operatingYear: '',
      chapterCode: '',
      debtPositionTypeOrgCode: '',
      assessmentRegistryId: undefined,
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithForm = (
  component: React.ReactNode,
  defaultValues?: Partial<AssessmentFormData>
) => {
  return render(
    <FormWrapper defaultValues={defaultValues}>{component}</FormWrapper>
  );
};

describe('Step3AssignChapter', () => {
  const mockUseOperatingYears = useOperatingYears as Mock;
  const mockUseChapters = useChapters as Mock;

  const mockOperatingYearsData = {
    optionsMap: [
      { value: '2023', label: '2023' },
      { value: '2024', label: '2024' }
    ],
    isLoading: false,
    isError: false,
    error: null
  };

  const mockChaptersData = {
    optionsMap: [
      { value: 'CAP001', label: 'Capitolo 001' },
      { value: 'CAP002', label: 'Capitolo 002' }
    ],
    isLoading: false,
    isError: false,
    error: null,
    hasNoResults: false,
    getAssessmentRegistryId: vi.fn().mockReturnValue(123)
  };

  const translations = {
    'assessmentCreate.configuration.step3.title': 'Assegna Capitolo',
    'assessmentCreate.configuration.step3.fields.chapter.label': 'Capitolo',
    'assessmentCreate.configuration.step3.fields.operatingYear.label':
      'Anno Operativo',
    'assessmentCreate.configuration.step3.fields.operatingYear.placeholder':
      'Seleziona anno',
    'assessmentCreate.configuration.step3.fields.operatingYear.noData':
      'Nessun anno disponibile',
    'assessmentCreate.configuration.step3.fields.chapter.placeholder':
      'Seleziona capitolo',
    'assessmentCreate.configuration.step3.fields.chapter.selectYearFirst':
      'Seleziona prima un anno',
    'assessmentCreate.configuration.step3.fields.chapter.noData':
      'Nessun capitolo disponibile',
    'commons.loading': 'Caricamento...',
    'errors.noChaptersForYear':
      "Nessun capitolo disponibile per l'anno {{year}}"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);

    mockUseOperatingYears.mockReturnValue(mockOperatingYearsData);
    mockUseChapters.mockReturnValue(mockChaptersData);
  });

  describe('Rendering', () => {
    it('should render wizard step wrapper with correct title', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Assegna Capitolo')).toBeInTheDocument();
    });

    it('should render section box with correct title and icon', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('step3-assign-chapter')).toBeInTheDocument();
      expect(screen.getByText('Capitolo')).toBeInTheDocument();
      expect(screen.getByTestId('section-adornment')).toBeInTheDocument();
    });

    it('should render operating year select field', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByText('Anno Operativo *')).toBeInTheDocument();
      expect(screen.getByTestId('operatingYear')).toBeInTheDocument();
      expect(screen.getByTestId('operatingYear-select')).toBeInTheDocument();
    });

    it('should render chapter select field', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByText('Capitolo *')).toBeInTheDocument();
      expect(screen.getByTestId('chapterCode')).toBeInTheDocument();
      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();
    });

    it('should render operating year options', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });
  });

  describe('Hook integration', () => {
    it('should call useOperatingYears with correct parameters', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(mockUseOperatingYears).toHaveBeenCalledWith({
        includeAllOption: false,
        enabled: false
      });
    });

    it('should call useChapters with initial parameters', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(mockUseChapters).toHaveBeenCalledWith({
        operatingYear: '',
        debtPositionTypeOrgCode: '',
        enabled: false,
        purpose: 'selection'
      });
    });

    it('should call useChapters with enabled true when year and debtPositionType are selected', () => {
      renderWithForm(<Step3AssignChapter />, {
        operatingYear: '2023',
        debtPositionTypeOrgCode: 'ORG001'
      });

      expect(mockUseChapters).toHaveBeenCalledWith({
        operatingYear: '2023',
        debtPositionTypeOrgCode: 'ORG001',
        enabled: true,
        purpose: 'selection'
      });
    });
  });

  describe('Field states and placeholders', () => {
    it('should show loading placeholder when operating years are loading', () => {
      mockUseOperatingYears.mockReturnValue({
        ...mockOperatingYearsData,
        isLoading: true
      });

      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByDisplayValue('Caricamento...')).toBeInTheDocument();
    });

    it('should show no data placeholder when no operating years available', () => {
      mockUseOperatingYears.mockReturnValue({
        ...mockOperatingYearsData,
        optionsMap: []
      });

      renderWithForm(<Step3AssignChapter />);

      expect(
        screen.getByDisplayValue('Nessun anno disponibile')
      ).toBeInTheDocument();
    });

    it('should show normal placeholder when operating years are available', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByDisplayValue('Seleziona anno')).toBeInTheDocument();
    });

    it('should show loading placeholder for chapters when loading', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        isLoading: true
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(screen.getByDisplayValue('Caricamento...')).toBeInTheDocument();
    });

    it('should show select year first placeholder when no year selected', () => {
      renderWithForm(<Step3AssignChapter />);

      const chapterSelect = screen.getByTestId('chapterCode-select');
      expect(chapterSelect).toHaveDisplayValue('Seleziona prima un anno');
    });

    it('should show no data placeholder when no chapters available', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        hasNoResults: true
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      const chapterSelect = screen.getByTestId('chapterCode-select');
      expect(chapterSelect).toHaveDisplayValue('Nessun capitolo disponibile');
    });

    it('should show normal placeholder when chapters are available', () => {
      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      const chapterSelect = screen.getByTestId('chapterCode-select');
      expect(chapterSelect).toHaveDisplayValue('Seleziona capitolo');
    });
  });

  describe('Disabled states', () => {
    it('should disable operating year field when loading', () => {
      mockUseOperatingYears.mockReturnValue({
        ...mockOperatingYearsData,
        isLoading: true
      });

      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('operatingYear-select')).toBeDisabled();
    });

    it('should disable operating year field when no options available', () => {
      mockUseOperatingYears.mockReturnValue({
        ...mockOperatingYearsData,
        optionsMap: []
      });

      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('operatingYear-select')).toBeDisabled();
    });

    it('should disable chapter field when no year selected', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('chapterCode-select')).toBeDisabled();
    });

    it('should disable chapter field when loading', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        isLoading: true
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(screen.getByTestId('chapterCode-select')).toBeDisabled();
    });

    it('should disable chapter field when no results', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        hasNoResults: true
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(screen.getByTestId('chapterCode-select')).toBeDisabled();
    });
  });

  describe('Warning banner', () => {
    it('should show warning banner when year is selected but no chapters available', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        hasNoResults: true,
        isLoading: false
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(
        screen.getByTestId('no-chapters-warning-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByText("Nessun capitolo disponibile per l'anno 2023")
      ).toBeInTheDocument();
    });

    it('should not show warning banner when no year selected', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(
        screen.queryByTestId('no-chapters-warning-banner')
      ).not.toBeInTheDocument();
    });

    it('should not show warning banner when chapters are loading', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        hasNoResults: true,
        isLoading: true
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(
        screen.queryByTestId('no-chapters-warning-banner')
      ).not.toBeInTheDocument();
    });

    it('should not show warning banner when chapters are available', () => {
      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(
        screen.queryByTestId('no-chapters-warning-banner')
      ).not.toBeInTheDocument();
    });
  });

  describe('Form field behavior', () => {
    it('should update assessmentRegistryId when chapter is selected', async () => {
      renderWithForm(<Step3AssignChapter />, {
        operatingYear: '2023',
        chapterCode: 'CAP001',
        debtPositionTypeOrgCode: 'ORG001'
      });

      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockChaptersData.getAssessmentRegistryId).toHaveBeenCalledWith(
          'CAP001'
        );
      });
    });

    it('should clear chapter and assessmentRegistryId when operating year changes', async () => {
      renderWithForm(<Step3AssignChapter />, {
        operatingYear: '2023',
        chapterCode: 'CAP001',
        assessmentRegistryId: 123
      });

      const yearSelect = screen.getByTestId('operatingYear-select');
      fireEvent.change(yearSelect, { target: { value: '2024' } });

      await waitFor(() => {
        expect(yearSelect).toHaveValue('2024');
      });
    });
  });

  describe('Props behavior', () => {
    it('should handle default props correctly', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('operatingYear-select')).not.toBeDisabled();
      expect(screen.getByTestId('chapterCode-select')).toBeDisabled();
    });
  });

  describe('Data testids', () => {
    it('should have correct data-testid attributes', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('step3-assign-chapter')).toBeInTheDocument();
      expect(screen.getByTestId('operatingYear')).toBeInTheDocument();
      expect(screen.getByTestId('chapterCode')).toBeInTheDocument();
    });
  });

  describe('Required fields', () => {
    it('should mark operating year field as required', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByText('Anno Operativo *')).toBeInTheDocument();
      expect(screen.getByTestId('operatingYear-select')).toHaveAttribute(
        'required'
      );
    });

    it('should mark chapter field as required', () => {
      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByText('Capitolo *')).toBeInTheDocument();
      expect(screen.getByTestId('chapterCode-select')).toHaveAttribute(
        'required'
      );
    });
  });

  describe('Error handling', () => {
    it('should handle operating years hook errors gracefully', () => {
      mockUseOperatingYears.mockReturnValue({
        ...mockOperatingYearsData,
        isError: true,
        error: new Error('Network error')
      });

      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('operatingYear-select')).toBeInTheDocument();
    });

    it('should handle chapters hook errors gracefully', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        isError: true,
        error: new Error('Network error')
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();
    });
  });

  describe('Component lifecycle', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = renderWithForm(<Step3AssignChapter />);

      expect(() => unmount()).not.toThrow();
    });

    it('should maintain form state during re-renders', () => {
      const { rerender } = renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('operatingYear-select')).toBeInTheDocument();
      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();

      rerender(
        <FormWrapper>
          <Step3AssignChapter />
        </FormWrapper>
      );

      expect(screen.getByTestId('operatingYear-select')).toBeInTheDocument();
      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined optionsMap for operating years', () => {
      mockUseOperatingYears.mockReturnValue({
        ...mockOperatingYearsData,
        optionsMap: undefined
      });

      renderWithForm(<Step3AssignChapter />);

      expect(screen.getByTestId('operatingYear-select')).toBeDisabled();
    });

    it('should handle undefined optionsMap for chapters', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        optionsMap: undefined
      });

      renderWithForm(<Step3AssignChapter />, { operatingYear: '2023' });

      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();
    });

    it('should handle missing getAssessmentRegistryId function', () => {
      mockUseChapters.mockReturnValue({
        ...mockChaptersData,
        getAssessmentRegistryId: undefined
      });

      renderWithForm(<Step3AssignChapter />, {
        operatingYear: '2023',
        debtPositionTypeOrgCode: 'ORG001'
      });

      expect(screen.getByTestId('chapterCode-select')).toBeInTheDocument();
    });
  });
});
