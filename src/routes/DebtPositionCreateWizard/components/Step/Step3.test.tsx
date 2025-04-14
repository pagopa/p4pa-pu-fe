import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PageRoutes } from '../../../../App';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Definizione dei tipi
type FormSubmitEvent = {
  preventDefault?: () => void;
};

type FormFieldValue<T> = {
  value: T;
  readonly: boolean;
};

type FormData = {
  paymentObject: FormFieldValue<string>;
  paymentOption: FormFieldValue<string>;
  amount: FormFieldValue<string>;
  dueDate: FormFieldValue<Date | null>;
  isMultibeneficiary: FormFieldValue<boolean>;
  beneficiaries?: Array<BeneficiaryItem>;
  installments?: Array<InstallmentItem>;
};

type BeneficiaryItem = {
  entityName: string;
  amount: string;
  taxCode?: string;
  iban?: string;
  postalAccount?: string;
  taxonomyCode?: string;
};

type InstallmentItem = {
  amount: string;
  dueDate: string;
};

// Utilizziamo una classe per garantire coerenza del tipo di ritorno
class WatchValueProvider {
  private isMultibeneficiary: boolean;
  private paymentOption: 'SINGLE' | 'INSTALLMENTS';
  private withBeneficiaries: boolean;

  constructor(options: {
    isMultibeneficiary: boolean;
    paymentOption: 'SINGLE' | 'INSTALLMENTS';
    withBeneficiaries?: boolean;
  }) {
    this.isMultibeneficiary = options.isMultibeneficiary;
    this.paymentOption = options.paymentOption;
    this.withBeneficiaries = options.withBeneficiaries || false;
  }

  getValue(key: string): unknown {
    switch (key) {
      case 'isMultibeneficiary.value':
        return this.isMultibeneficiary;
      case 'amount.value':
        return '100.00';
      case 'beneficiaries':
        if (this.withBeneficiaries) {
          return [{ entityName: 'Test', amount: '50.00' } as BeneficiaryItem];
        }
        return [];
      case 'paymentOption.value':
        return this.paymentOption;
      default:
        return '';
    }
  }
}

// Mocks per i componenti e le librerie
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../../../utils/fieldValidation', () => ({
  isBeneficiariesTotalValid: vi.fn().mockReturnValue(true),
  createAmountValidator: () => ({ required: 'Campo obbligatorio' }),
  createDateValidator: () => ({})
}));

vi.mock('../../../../utils/formatters', () => ({
  formatDate: (date: string) => date
}));

// Mock per react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock per react-hook-form (semplificato, ma con tipi)
const mockSetValue = vi.fn();
const mockTrigger = vi.fn();
const mockGetValues = vi.fn().mockReturnValue({} as Record<string, unknown>);

// Provider iniziale per i valori di default
const defaultProvider = new WatchValueProvider({
  isMultibeneficiary: false,
  paymentOption: 'SINGLE'
});

// Definiamo il mock di watch
const mockWatch = vi
  .fn()
  .mockImplementation((key: string) => defaultProvider.getValue(key));

// Funzione per ottenere il valore del campo in base al nome
const getFieldValue = (fieldName: string): string => {
  if (fieldName.includes('amount')) {
    return '100.00';
  }
  if (fieldName.includes('paymentOption')) {
    return 'SINGLE';
  }
  return '';
};

vi.mock('react-hook-form', () => {
  return {
    useForm: () => ({
      handleSubmit: (fn: (data: FormData) => void) => (e?: FormSubmitEvent) => {
        e?.preventDefault?.();
        fn({
          paymentObject: { value: 'Test Payment', readonly: false },
          paymentOption: { value: 'SINGLE', readonly: false },
          amount: { value: '100.00', readonly: false },
          dueDate: { value: new Date(), readonly: false },
          isMultibeneficiary: { value: false, readonly: false }
        });
        return Promise.resolve();
      },
      control: {},
      formState: { errors: {}, isSubmitted: false },
      watch: mockWatch,
      setValue: mockSetValue,
      trigger: mockTrigger,
      getValues: mockGetValues
    }),
    Controller: ({
      name,
      render
    }: {
      name: string;
      render: (props: Record<string, unknown>) => React.ReactElement;
    }) => {
      const nameString = String(name);
      return render({
        field: {
          onChange: vi.fn(),
          value: getFieldValue(nameString),
          onBlur: vi.fn(),
          ref: vi.fn(),
          name: nameString
        },
        fieldState: {}
      });
    }
  };
});

// Mocks per i componenti MUI
type ChildrenProps = {
  children: React.ReactNode;
};

type WizardStepWrapperProps = {
  title: string;
  subtitle?: string;
} & ChildrenProps;

type SectionBoxProps = {
  title: string;
  adornment?: React.ReactNode;
} & ChildrenProps;

type StepButtonsProps = {
  onBack: () => void;
  onNext: () => void;
  disableNext?: boolean;
  nextLabel?: string;
};

type InstallmentFieldProps = {
  onInstallmentsChange?: (totalAmount: string) => void;
  [key: string]: unknown;
};

vi.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }: ChildrenProps) => <>{children}</>
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: () => <div data-testid="date-picker" />
}));

vi.mock('../Beneficiary/BeneficiaryField', () => ({
  default: () => <div data-testid="beneficiary-field">Beneficiary Field</div>
}));

vi.mock('../Installment/InstallmentField', () => ({
  default: (props: InstallmentFieldProps) => {
    if (props.onInstallmentsChange) {
      setTimeout(() => {
        if (typeof props.onInstallmentsChange === 'function') {
          props.onInstallmentsChange('200.00');
        }
      }, 0);
    }
    return <div data-testid="installment-field">Installment Field</div>;
  }
}));

vi.mock('../../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({ children, title }: WizardStepWrapperProps) => (
    <div data-testid="wizard-step-wrapper">
      <div data-testid="title">{title}</div>
      {children}
    </div>
  )
}));

vi.mock('../../../../components/Wizard/SectionBox', () => ({
  default: ({ children, title }: SectionBoxProps) => (
    <div data-testid="section-box">
      <div data-testid="section-title">{title}</div>
      {children}
    </div>
  )
}));

vi.mock('../../../../components/Wizard/WizardStepButtons', () => ({
  default: ({ onBack, onNext }: StepButtonsProps) => (
    <div data-testid="wizard-step-buttons">
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
      <button onClick={onNext} data-testid="next-button">
        Next
      </button>
    </div>
  )
}));

// Importiamo il componente dopo tutti i mock
import Step3 from './Step3';
import { isBeneficiariesTotalValid } from '../../../../utils/fieldValidation';

describe('Step3 Component', () => {
  const mockSetData = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset del mockWatch al valore predefinito
    const defaultProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'SINGLE'
    });
    mockWatch.mockImplementation((key: string) =>
      defaultProvider.getValue(key)
    );
  });

  // Dati iniziali per i test
  const initialData = {
    paymentObject: { value: 'Test Payment', readonly: false },
    paymentOption: { value: 'SINGLE', readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: null, readonly: false },
    flagMandatoryDueDate: false,
    isMultibeneficiary: { value: false, readonly: false }
  };

  it('dovrebbe renderizzare correttamente con i dati iniziali', () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('section-box')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();

    expect(screen.getByTestId('title')).toHaveTextContent(
      'debtPositionCreateWizard.configurationAlert.title'
    );
    expect(screen.getByTestId('section-title')).toHaveTextContent(
      'debtPositionCreateWizard.step3.title'
    );
  });

  it('dovrebbe chiamare onBack quando si clicca sul pulsante indietro', () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('dovrebbe mostrare InstallmentField quando paymentOption è INSTALLMENTS', () => {
    // Modifica il mock di watch per simulare l'opzione a rate selezionata
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('installment-field')).toBeInTheDocument();
  });

  it('dovrebbe navigare alla pagina di completamento dopo il submit con successo', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    // Submit del form cliccando il pulsante Next
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED,
        expect.objectContaining({
          state: expect.any(Object),
          replace: true
        })
      );
    });
  });

  it('dovrebbe validare il totale dei beneficiari quando isMultibeneficiary è true', async () => {
    // Configura mock per simulare modalità multibeneficiario
    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
    );

    // Simula una validazione fallita
    vi.mocked(isBeneficiariesTotalValid).mockReturnValueOnce(false);

    mockGetValues.mockReturnValue({
      beneficiaries: [{ entityName: 'Test', amount: '50.00' }],
      amount: { value: '100.00' }
    } as Record<string, unknown>);

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            isMultibeneficiary: { value: true, readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith('beneficiaries');
    });
  });
});
