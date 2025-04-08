import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DebtPositionCreateWizard from './DebtPositionCreateWizard';

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock dei componenti figli
vi.mock('./components/Step1GeneralConfiguration', () => ({
  default: ({
    data,
    setData,
    onNext
  }: {
    data: {
      debtPositionType: { value: string; readonly: boolean };
      description: { value: string; readonly: boolean };
    };
    setData: (data: {
      debtPositionType: { value: string; readonly: boolean };
      description: { value: string; readonly: boolean };
    }) => void;
    onNext: () => void;
  }) => {
    return (
      <div data-testid="step1-component">
        <input
          data-testid="debtPositionType-input"
          value={data.debtPositionType.value}
          onChange={(e) =>
            setData({
              ...data,
              debtPositionType: {
                ...data.debtPositionType,
                value: e.target.value
              }
            })
          }
        />
        <input
          data-testid="description-input"
          value={data.description.value}
          onChange={(e) =>
            setData({
              ...data,
              description: {
                ...data.description,
                value: e.target.value
              }
            })
          }
        />
        <button data-testid="next-button" onClick={onNext}>
          Avanti
        </button>
      </div>
    );
  }
}));

vi.mock('../../components/Wizard/WizardStepper', () => ({
  default: ({ activeStep }: { activeStep: number }) => {
    return (
      <div data-testid="wizard-stepper">{`Active Step: ${activeStep}`}</div>
    );
  }
}));

vi.mock('../../components/Wizard/WizardStepWrapper', () => ({
  default: ({
    children,
    title,
    subtitle
  }: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
  }) => {
    return (
      <div data-testid="wizard-step-wrapper">
        <h2>{title}</h2>
        <h3>{subtitle}</h3>
        {children}
      </div>
    );
  }
}));

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: ({ title, description }: { title: string; description: string }) => {
    return (
      <div data-testid="title-component">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    );
  }
}));

describe('DebtPositionCreateWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test del rendering iniziale
  test('renders correctly with initial state', () => {
    render(<DebtPositionCreateWizard />);

    // Verifica che i componenti principali siano renderizzati
    expect(screen.getByTestId('title-component')).toBeDefined();
    expect(screen.getByTestId('wizard-stepper')).toBeDefined();
    expect(screen.getByTestId('wizard-step-wrapper')).toBeDefined();
    expect(screen.getByTestId('step1-component')).toBeDefined();
  });

  // Test dell'aggiornamento dei dati del form
  test('updates form data when input changes', async () => {
    render(<DebtPositionCreateWizard />);

    // Simulazione dell'inserimento di dati nei campi
    const debtPositionTypeInput = screen.getByTestId('debtPositionType-input');
    const descriptionInput = screen.getByTestId('description-input');

    // Cambia il valore del tipo di posizione debitoria
    await fireEvent.change(debtPositionTypeInput, {
      target: { value: 'TIPO_1' }
    });

    // Cambia il valore della descrizione
    await fireEvent.change(descriptionInput, {
      target: { value: 'Descrizione test' }
    });

    // Verifica che i valori siano stati aggiornati
    expect(debtPositionTypeInput).toHaveValue('TIPO_1');
    expect(descriptionInput).toHaveValue('Descrizione test');
  });

  // Test della navigazione tra gli step (anche se c'è solo uno step, testiamo la funzionalità)
  test('navigates to next step when clicking next button', async () => {
    render(<DebtPositionCreateWizard />);

    // Ottieni il pulsante avanti
    const nextButton = screen.getByTestId('next-button');

    // Cliccando su "Avanti" dovrebbe tentare di andare allo step successivo
    await fireEvent.click(nextButton);

    // Dopo aver cliccato avanti, lo step dovrebbe essere incrementato a 1
    // Verifichiamo dal testo del WizardStepper
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 1'
    );
  });
});
