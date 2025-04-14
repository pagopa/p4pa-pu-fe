import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step1GeneralConfiguration, {
  Step1Data
} from './Step1GeneralConfiguration';
import { useStore } from '../../../../store/GlobalStore';
import { useDebtPositionsTypeOrg } from '../../../../hooks/useDebtPositionsTypeOrg';
import { useTranslation } from 'react-i18next';

// Mock dei moduli necessari
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}));

vi.mock('../../../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: vi.fn()
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

  const mockDebtPositionsTypes = [
    { value: '1', label: 'Tipo 1' },
    { value: '2', label: 'Tipo 2' }
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
      'La descrizione è obbligatoria',
    'debtPositionCreateWizard.step1.minWords':
      'La descrizione deve contenere almeno 3 parole'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      t: (key: string) => mockTranslations[key] || key
    });

    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { organizationId: '123' }
    });

    (
      useDebtPositionsTypeOrg as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      optionsMap: mockDebtPositionsTypes
    });
  });

  it('renderizza correttamente il componente con i campi vuoti', () => {
    render(
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

  it('pre-compila i campi con i dati iniziali', () => {
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

    render(
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

  it('disabilita i campi quando sono in modalità readonly', () => {
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

    render(
      <Step1GeneralConfiguration
        data={readonlyData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Verifica tramite getByRole e attributo aria-disabled
    const descriptionInput = screen.getByRole('textbox', {
      name: /Descrizione/i
    });
    const typeSelect = screen.getByRole('combobox', {
      name: /Tipo di dovuto/i
    });

    expect(descriptionInput).toHaveAttribute('disabled');
    expect(typeSelect).toHaveAttribute('aria-disabled', 'true');
  });

  it('mostra errori di validazione quando i campi sono vuoti', async () => {
    render(
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

  it('verifica che la descrizione abbia almeno 3 parole', async () => {
    render(
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

    // Seleziona un tipo di dovuto
    const typeInput = screen.getByLabelText(/Tipo di dovuto/i);
    fireEvent.mouseDown(typeInput);
    const options = screen.getAllByRole('option');
    const option = options.find((opt) => opt.textContent === 'Tipo 1');
    if (!option) {
      throw new Error('Opzione "Tipo 1" non trovata');
    }
    fireEvent.click(option);

    // Inserisci una descrizione con meno di 3 parole
    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    fireEvent.change(descriptionInput, { target: { value: 'Due parole' } });

    // Prova a procedere
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(
        screen.getByText('La descrizione deve contenere almeno 3 parole')
      ).toBeInTheDocument();
    });

    // Aggiorna la descrizione con 3 parole
    fireEvent.change(descriptionInput, {
      target: { value: 'Descrizione con tre parole' }
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
          value: 'Descrizione con tre parole',
          readonly: false
        }
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('chiama onBack quando si clicca il pulsante indietro', () => {
    render(
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

  it('chiama setData e onNext quando il form è valido', async () => {
    render(
      <Step1GeneralConfiguration
        data={mockInitialData}
        setData={mockSetData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Seleziona un tipo di dovuto
    const typeInput = screen.getByLabelText(/Tipo di dovuto/i);
    fireEvent.mouseDown(typeInput);
    const option = screen.getByText('Tipo 1');
    fireEvent.click(option);

    // Inserisci una descrizione valida
    const descriptionInput = screen.getByLabelText(/Descrizione/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Questa è una descrizione valida' }
    });

    // Procedi al prossimo step
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
});
