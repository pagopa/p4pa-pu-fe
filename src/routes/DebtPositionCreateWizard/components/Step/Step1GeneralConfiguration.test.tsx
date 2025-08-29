import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Step1GeneralConfiguration from './Step1GeneralConfiguration';
import { Step1Data } from '../../../../models/DebtPositionType';
import { useStore } from '../../../../store/GlobalStore';
import { useTranslation } from 'react-i18next';

// Mock the necessary modules
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}));

vi.mock('../../../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

// Mock the getDebtPositionTypeOrgs API
vi.mock('../../../../api/debtPositionsTypeOrg', () => ({
  getDebtPositionTypeOrgs: vi.fn()
}));

vi.mock('../../../../components/Wizard/SectionBox', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="section-box">{children}</div>
  )
}));

vi.mock('../../../../components/Wizard/WizardStepButtons', () => ({
  default: ({
    onNext,
    onBack
  }: {
    onNext: () => void;
    onBack?: () => void;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      <button data-testid="next-button" onClick={onNext}>
        Next
      </button>
    </div>
  )
}));

vi.mock('../../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wizard-step-wrapper">{children}</div>
  )
}));

describe('Step1GeneralConfiguration', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  let queryClient: QueryClient;

  const mockDebtPositionTypeOrgsData = [
    {
      debtPositionTypeOrgId: 1,
      description: 'Tipo 1',
      flagMandatoryDueDate: false,
      flagActive: true,
      code: 'TYPE_1'
    },
    {
      debtPositionTypeOrgId: 2,
      description: 'Tipo 2',
      flagMandatoryDueDate: true,
      flagActive: true,
      code: 'TYPE_2'
    }
  ];

  const mockInitialData: Step1Data = {
    debtPositionType: {
      value: '',
      flagMandatoryDueDate: false,
      readonly: false
    },
    description: {
      value: '',
      readonly: false
    }
  };

  const mockTranslations: Record<string, string> = {
    'debtPositionCreateWizard.generalConfiguration.title':
      'Configurazione generale',
    'debtPositionCreateWizard.generalConfiguration.subtitle':
      'Inserisci i dati generali',
    'debtPositionCreateWizard.step1.title': 'Dati generali',
    'debtPositionCreateWizard.step1.debtPositionType.label': 'Tipo di dovuto',
    'debtPositionCreateWizard.step1.debtPositionType.required':
      'Il tipo di dovuto è obbligatorio',
    'debtPositionCreateWizard.step1.description.label': 'Descrizione',
    'debtPositionCreateWizard.step1.description.required':
      'La descrizione è obbligatoria'
  };

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    (useTranslation as ReturnType<typeof vi.fn>).mockReturnValue({
      t: (key: string) => mockTranslations[key] || key
    });

    (useStore as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { organizationId: 123 }
    });

    const { getDebtPositionTypeOrgs } = await import(
      '../../../../api/debtPositionsTypeOrg'
    );
    (getDebtPositionTypeOrgs as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDebtPositionTypeOrgsData,
      isLoading: false,
      error: null
    });
  });

  it('should render the component correctly with empty fields', () => {
    renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('section-box')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo di dovuto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrizione/i)).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
  });

  it('should pre-fill fields with initial data', () => {
    const prefilledData: Step1Data = {
      debtPositionType: {
        value: '1',
        flagMandatoryDueDate: true,
        readonly: false
      },
      description: {
        value: 'Descrizione di test',
        readonly: false
      }
    };

    renderWithProviders(
      <Step1GeneralConfiguration
        data={prefilledData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    expect(descriptionInput).toHaveValue('Descrizione di test');
  });

  it('should disable fields when in readonly mode', () => {
    const readonlyData: Step1Data = {
      debtPositionType: {
        value: '1',
        flagMandatoryDueDate: true,
        readonly: true
      },
      description: {
        value: 'Descrizione di test',
        readonly: true
      }
    };

    renderWithProviders(
      <Step1GeneralConfiguration
        data={readonlyData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const descriptionInput = screen.getByRole('textbox', {
      name: /Descrizione/i
    });
    const typeSelect = screen.getByRole('combobox', {
      name: /Tipo di dovuto/i
    });

    expect(descriptionInput).toHaveAttribute('disabled');
    expect(typeSelect).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show validation errors when fields are empty', async () => {
    renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(
        screen.getByText('Il tipo di dovuto è obbligatorio')
      ).toBeInTheDocument();
      expect(
        screen.getByText('La descrizione è obbligatoria')
      ).toBeInTheDocument();
    });

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should invalidate description with only spaces and accept non-empty', async () => {
    renderWithProviders(
      <Step1GeneralConfiguration
        data={{
          debtPositionType: {
            value: '1',
            flagMandatoryDueDate: false,
            readonly: false
          },
          description: {
            value: '',
            readonly: false
          }
        }}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Select a debt position type
    const typeInput = screen.getByLabelText(/Tipo di dovuto/i);
    fireEvent.mouseDown(typeInput);
    const options = screen.getAllByRole('option');
    const option = options.find((opt) => opt.textContent === 'Tipo 1');
    if (!option) {
      throw new Error('Option "Tipo 1" not found');
    }
    fireEvent.click(option);

    // Enter a description made of spaces only
    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    fireEvent.change(descriptionInput, { target: { value: '   ' } });

    // Try to proceed
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(
        screen.getByText('La descrizione è obbligatoria')
      ).toBeInTheDocument();
    });

    // Update description with a non-empty value (single word)
    fireEvent.change(descriptionInput, {
      target: { value: 'Valida' }
    });
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtPositionType: {
          value: '1',
          flagMandatoryDueDate: false,
          readonly: false
        },
        description: {
          value: 'Valida',
          readonly: false
        }
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('should call onBack when back button is clicked', () => {
    renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should call setData and onNext when form is valid', async () => {
    renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Select a debt position type
    const typeInput = screen.getByLabelText(/Tipo di dovuto/i);
    fireEvent.mouseDown(typeInput);
    const option = screen.getByText('Tipo 1');
    fireEvent.click(option);

    // Enter a valid description
    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Questa è una descrizione valida' }
    });

    // Proceed to next step
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtPositionType: {
          value: '1',
          flagMandatoryDueDate: false,
          readonly: false
        },
        description: {
          value: 'Questa è una descrizione valida',
          readonly: false
        }
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('should render null when data is not ready', async () => {
    // Mock loading state
    const { getDebtPositionTypeOrgs } = await import(
      '../../../../api/debtPositionsTypeOrg'
    );
    (getDebtPositionTypeOrgs as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    });

    const { container } = renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Should render nothing when data is not ready
    expect(container.firstChild).toBeNull();
  });

  it('should handle editing mode with valid debtPositionTypeOrgCode', async () => {
    const editingData: Step1Data = {
      debtPositionType: {
        value: '',
        flagMandatoryDueDate: false,
        readonly: false
      },
      description: {
        value: 'Existing description',
        readonly: false
      }
    };

    renderWithProviders(
      <Step1GeneralConfiguration
        data={editingData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        isEditing={true}
        debtPositionTypeOrgCode="TYPE_1"
      />
    );

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.objectContaining({
          debtPositionType: expect.objectContaining({
            value: '1',
            flagMandatoryDueDate: false
          }),
          description: expect.objectContaining({
            value: 'Existing description'
          })
        })
      );
    });
  });

  it('should handle editing mode when no matching type is found', async () => {
    const editingData: Step1Data = {
      debtPositionType: {
        value: '',
        flagMandatoryDueDate: false,
        readonly: false
      },
      description: {
        value: 'Test description',
        readonly: false
      }
    };

    renderWithProviders(
      <Step1GeneralConfiguration
        data={editingData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        isEditing={true}
        debtPositionTypeOrgCode="NONEXISTENT_TYPE"
      />
    );

    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    expect(descriptionInput).toHaveValue('Test description');
  });

  it('should handle editing mode when debtPositionTypeOrgsData is undefined', async () => {
    // Mock undefined data
    const { getDebtPositionTypeOrgs } = await import(
      '../../../../api/debtPositionsTypeOrg'
    );
    (getDebtPositionTypeOrgs as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    });

    const editingData: Step1Data = {
      debtPositionType: {
        value: '',
        flagMandatoryDueDate: false,
        readonly: false
      },
      description: {
        value: 'Test description',
        readonly: false
      }
    };

    const { container } = renderWithProviders(
      <Step1GeneralConfiguration
        data={editingData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        isEditing={true}
        debtPositionTypeOrgCode="TYPE_1"
      />
    );

    // Should render null when editing but data is not ready
    expect(container.firstChild).toBeNull();
  });

  it('should handle editing mode without debtPositionTypeOrgCode', async () => {
    const editingData: Step1Data = {
      debtPositionType: {
        value: '1',
        flagMandatoryDueDate: false,
        readonly: false
      },
      description: {
        value: 'Test description',
        readonly: false
      }
    };

    const { container } = renderWithProviders(
      <Step1GeneralConfiguration
        data={editingData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        isEditing={true}
      />
    );

    // Should render null when editing without debtPositionTypeOrgCode
    expect(container.firstChild).toBeNull();
  });

  it('should handle form submission with flagMandatoryDueDate true', async () => {
    // Mock data with flagMandatoryDueDate true
    const { getDebtPositionTypeOrgs } = await import(
      '../../../../api/debtPositionsTypeOrg'
    );
    (getDebtPositionTypeOrgs as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          debtPositionTypeOrgId: 2,
          description: 'Tipo 2',
          flagMandatoryDueDate: true,
          flagActive: true,
          code: 'TYPE_2'
        }
      ],
      isLoading: false,
      error: null
    });

    renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Select debt position type with flagMandatoryDueDate: true
    const typeInput = screen.getByLabelText(/Tipo di dovuto/i);
    fireEvent.mouseDown(typeInput);
    const option = screen.getByText('Tipo 2');
    fireEvent.click(option);

    // Enter valid description
    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Valid description with three words' }
    });

    // Submit form
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtPositionType: {
          value: '2',
          flagMandatoryDueDate: true,
          readonly: false
        },
        description: {
          value: 'Valid description with three words',
          readonly: false
        }
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('should handle empty debtPositionTypeOrgsData array', async () => {
    // Mock empty data array
    const { getDebtPositionTypeOrgs } = await import(
      '../../../../api/debtPositionsTypeOrg'
    );
    (getDebtPositionTypeOrgs as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    renderWithProviders(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Should still render the form but with no options
    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo di dovuto/i)).toBeInTheDocument();
  });

  it('should handle editing mode with matching org but no matching select option', async () => {
    // Mock data where debtPositionTypeOrgId doesn't match any processed types
    const { getDebtPositionTypeOrgs } = await import(
      '../../../../api/debtPositionsTypeOrg'
    );
    (getDebtPositionTypeOrgs as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          debtPositionTypeOrgId: 999, // ID that won't match our processed types
          description: 'Tipo Non Processato',
          flagMandatoryDueDate: false,
          flagActive: true,
          code: 'TYPE_1'
        }
      ],
      isLoading: false,
      error: null
    });

    const editingData: Step1Data = {
      debtPositionType: {
        value: '',
        flagMandatoryDueDate: false,
        readonly: false
      },
      description: {
        value: 'Test description',
        readonly: false
      }
    };

    renderWithProviders(
      <Step1GeneralConfiguration
        data={editingData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        isEditing={true}
        debtPositionTypeOrgCode="TYPE_1"
      />
    );

    // Wait for component to render and verify it renders correctly
    await waitFor(() => {
      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByLabelText(/Tipo di dovuto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Descrizione/i)).toBeInTheDocument();
    });

    // Verify description input has the correct value
    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    expect(descriptionInput).toHaveValue('Test description');
  });

  it('should handle editing mode with description value and setValue', async () => {
    const editingData: Step1Data = {
      debtPositionType: {
        value: '',
        flagMandatoryDueDate: false,
        readonly: false
      },
      description: {
        value: 'Existing description value',
        readonly: false
      }
    };

    renderWithProviders(
      <Step1GeneralConfiguration
        data={editingData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
        isEditing={true}
        debtPositionTypeOrgCode="TYPE_1"
      />
    );

    await waitFor(() => {
      const descriptionInput = screen.getByLabelText(/Descrizione/i);
      expect(descriptionInput).toHaveValue('Existing description value');
    });

    // Verify that setValue for description was called
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
    });
  });
});
