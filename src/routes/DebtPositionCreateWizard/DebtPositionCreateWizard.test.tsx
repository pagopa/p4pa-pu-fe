import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DebtPositionCreateWizard from './DebtPositionCreateWizard';
import { BrowserRouter } from 'react-router-dom';

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock di react-router
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useNavigate: () => mockNavigate
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

// Mock dello Step3
vi.mock('./components/Step3', () => ({
  default: ({
    onNext,
    onBack
  }: {
    data: {
      paymentObject: { value: string; readonly: boolean };
      paymentOption: { value: string; readonly: boolean };
      amount: { value: string; readonly: boolean };
      dueDate: { value: string | null; readonly: boolean };
      flagMandatoryDueDate: boolean;
      isMultibeneficiary: { value: boolean; readonly: boolean };
      beneficiaries?: Array<{
        entityName: string;
        amount: string;
        taxCode: string;
        iban: string;
        postalAccount: string;
        taxonomyCode: string;
      }>;
    };
    setData: (data: {
      paymentObject: { value: string; readonly: boolean };
      paymentOption: { value: string; readonly: boolean };
      amount: { value: string; readonly: boolean };
      dueDate: { value: string | null; readonly: boolean };
      flagMandatoryDueDate: boolean;
      isMultibeneficiary: { value: boolean; readonly: boolean };
      beneficiaries?: Array<{
        entityName: string;
        amount: string;
        taxCode: string;
        iban: string;
        postalAccount: string;
        taxonomyCode: string;
      }>;
    }) => void;
    onNext: () => void;
    onBack: () => void;
  }) => {
    return (
      <div data-testid="step3-component">
        <button data-testid="back-button-step3" onClick={onBack}>
          Indietro
        </button>
        <button data-testid="next-button-step3" onClick={onNext}>
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
    render(
      <BrowserRouter>
        <DebtPositionCreateWizard />
      </BrowserRouter>
    );

    // Verifica che i componenti principali siano renderizzati
    expect(screen.getByTestId('title-component')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-stepper')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('step1-component')).toBeInTheDocument();
  });

  // Test della navigazione tra gli step
  test('navigates between steps correctly', async () => {
    render(
      <BrowserRouter>
        <DebtPositionCreateWizard />
      </BrowserRouter>
    );

    // Verifica che siamo nello step 1
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 0'
    );
    expect(screen.getByTestId('step1-component')).toBeInTheDocument();

    // Passa allo step 2
    const nextButton = screen.getByTestId('next-button');
    await fireEvent.click(nextButton);

    // Verifica che siamo nello step 2
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 1'
    );
    expect(screen.getByTestId('step2-component')).toBeInTheDocument();

    // Torna allo step 1
    const backButton = screen.getByTestId('back-button');
    await fireEvent.click(backButton);

    // Verifica che siamo tornati allo step 1
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 0'
    );
    expect(screen.getByTestId('step1-component')).toBeInTheDocument();

    // Passa nuovamente allo step 2
    const nextButtonAgain = screen.getByTestId('next-button');
    await fireEvent.click(nextButtonAgain);

    // Verifica che siamo nello step 2
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 1'
    );
    expect(screen.getByTestId('step2-component')).toBeInTheDocument();

    // Passa allo step 3
    const nextButtonStep2 = screen.getByTestId('next-button-step2');
    await fireEvent.click(nextButtonStep2);

    // Verifica che siamo nello step 3
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 2'
    );
    expect(screen.getByTestId('step3-component')).toBeInTheDocument();

    // Torna allo step 2
    const backButtonStep3 = screen.getByTestId('back-button-step3');
    await fireEvent.click(backButtonStep3);

    // Verifica che siamo tornati allo step 2
    expect(screen.getByTestId('wizard-stepper')).toHaveTextContent(
      'Active Step: 1'
    );
    expect(screen.getByTestId('step2-component')).toBeInTheDocument();
  });
});
