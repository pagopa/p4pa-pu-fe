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

// Mock dello Step2AddDebtor
vi.mock('./components/Step2AddDebtor', () => ({
  default: ({
    data,
    setData,
    onNext,
    onBack
  }: {
    data: {
      subjectType: { value: string; readonly: boolean };
      taxCode: { value: string; readonly: boolean };
      fullName: { value: string; readonly: boolean };
      address: { value: string; readonly: boolean };
      civicNumber: { value: string; readonly: boolean };
      zipCode: { value: string; readonly: boolean };
      country: { value: string; readonly: boolean };
      province: { value: string; readonly: boolean };
      city: { value: string; readonly: boolean };
    };
    setData: (data: {
      subjectType: { value: string; readonly: boolean };
      taxCode: { value: string; readonly: boolean };
      fullName: { value: string; readonly: boolean };
      address: { value: string; readonly: boolean };
      civicNumber: { value: string; readonly: boolean };
      zipCode: { value: string; readonly: boolean };
      country: { value: string; readonly: boolean };
      province: { value: string; readonly: boolean };
      city: { value: string; readonly: boolean };
    }) => void;
    onNext: () => void;
    onBack?: () => void;
  }) => {
    return (
      <div data-testid="step2-component">
        <input
          data-testid="subjectType-input"
          value={data.subjectType.value}
          onChange={(e) =>
            setData({
              ...data,
              subjectType: {
                ...data.subjectType,
                value: e.target.value
              }
            })
          }
        />
        <input
          data-testid="taxCode-input"
          value={data.taxCode.value}
          onChange={(e) =>
            setData({
              ...data,
              taxCode: {
                ...data.taxCode,
                value: e.target.value
              }
            })
          }
        />
        <button data-testid="back-button" onClick={onBack}>
          Indietro
        </button>
        <button data-testid="next-button-step2" onClick={onNext}>
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
    expect(screen.getByTestId('title-component')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-stepper')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('step1-component')).toBeInTheDocument();
  });

  // Test dell'aggiornamento dei dati del form nel primo step
  test('updates form data when input changes in step 1', async () => {
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

  // Test della navigazione dallo step 1 allo step 2
  test('navigates from step 1 to step 2 when clicking next button', async () => {
    render(<DebtPositionCreateWizard />);

    // Ottieni il pulsante avanti
    const nextButton = screen.getByTestId('next-button');

    // Cliccando su "Avanti" dovrebbe tentare di andare allo step successivo
    await fireEvent.click(nextButton);

    // Dopo aver cliccato avanti, lo step dovrebbe essere incrementato a 1
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 1'
    );

    // Verifica che lo step 2 sia renderizzato
    expect(screen.getByTestId('step2-component')).toBeInTheDocument();
  });

  // Test dell'aggiornamento dei dati del form nel secondo step
  test('updates form data when input changes in step 2', async () => {
    render(<DebtPositionCreateWizard />);

    // Passa al secondo step
    const nextButton = screen.getByTestId('next-button');
    await fireEvent.click(nextButton);

    // Simulazione dell'inserimento di dati nei campi
    const subjectTypeInput = screen.getByTestId('subjectType-input');
    const taxCodeInput = screen.getByTestId('taxCode-input');

    // Cambia il valore del tipo di soggetto
    await fireEvent.change(subjectTypeInput, {
      target: { value: 'PF' }
    });

    // Cambia il valore del codice fiscale
    await fireEvent.change(taxCodeInput, {
      target: { value: 'RSSMRA80A01H501U' }
    });

    // Verifica che i valori siano stati aggiornati
    expect(subjectTypeInput).toHaveValue('PF');
    expect(taxCodeInput).toHaveValue('RSSMRA80A01H501U');
  });

  // Test della navigazione indietro dallo step 2 allo step 1
  test('navigates back from step 2 to step 1 when clicking back button', async () => {
    render(<DebtPositionCreateWizard />);

    // Passa al secondo step
    const nextButton = screen.getByTestId('next-button');
    await fireEvent.click(nextButton);

    // Verifica di essere nello step 2
    expect(screen.getByTestId('step2-component')).toBeInTheDocument();

    // Ottieni il pulsante indietro
    const backButton = screen.getByTestId('back-button');

    // Cliccando su "Indietro" dovrebbe tornare allo step precedente
    await fireEvent.click(backButton);

    // Dopo aver cliccato indietro, lo step dovrebbe essere decrementato a 0
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 0'
    );

    // Verifica che lo step 1 sia renderizzato
    expect(screen.getByTestId('step1-component')).toBeInTheDocument();
  });

  // Test del flusso completo: step1 -> step2 -> step1 -> step2 (dati mantenuti)
  test('maintains form data when navigating between steps', async () => {
    render(<DebtPositionCreateWizard />);

    // Step 1: Compila i dati
    const debtPositionTypeInput = screen.getByTestId('debtPositionType-input');
    const descriptionInput = screen.getByTestId('description-input');

    await fireEvent.change(debtPositionTypeInput, {
      target: { value: 'TIPO_1' }
    });
    await fireEvent.change(descriptionInput, {
      target: { value: 'Descrizione test' }
    });

    // Passa allo step 2
    const nextButton = screen.getByTestId('next-button');
    await fireEvent.click(nextButton);

    // Step 2: Compila i dati
    const subjectTypeInput = screen.getByTestId('subjectType-input');
    const taxCodeInput = screen.getByTestId('taxCode-input');

    await fireEvent.change(subjectTypeInput, { target: { value: 'PF' } });
    await fireEvent.change(taxCodeInput, {
      target: { value: 'RSSMRA80A01H501U' }
    });

    // Torna allo step 1
    const backButton = screen.getByTestId('back-button');
    await fireEvent.click(backButton);

    // Verifica che i dati dello step 1 siano mantenuti
    expect(screen.getByTestId('debtPositionType-input')).toHaveValue('TIPO_1');
    expect(screen.getByTestId('description-input')).toHaveValue(
      'Descrizione test'
    );

    // Passa nuovamente allo step 2
    const nextButtonStep1 = screen.getByTestId('next-button');
    await fireEvent.click(nextButtonStep1);

    // Ora siamo nello step 2, quindi possiamo verificare i campi
    // Verifica che i dati dello step 2 siano mantenuti
    expect(screen.getByTestId('subjectType-input')).toHaveValue('PF');
    expect(screen.getByTestId('taxCode-input')).toHaveValue('RSSMRA80A01H501U');
  });
});
