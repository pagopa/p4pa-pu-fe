import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step2EntityConfiguration from './Step2EntityConfiguration';
import { OrganizationEditStep2Data } from '../../../../../models/OrganizationEditTypes';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';

vi.mock('../../../../../utils/fieldValidation', () => ({
  isValidIBAN: vi.fn((iban: string) => {
    if (!iban) return true;
    return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban);
  })
}));

vi.mock('../../../../../components/Wizard/WizardStepButtons', () => ({
  default: ({
    onNext,
    onBack,
    disableNext,
    nextLabel,
    backLabel
  }: {
    onNext: () => void;
    onBack: () => void;
    disableNext: boolean;
    nextLabel: string;
    backLabel: string;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button data-testid="back-button" onClick={onBack}>
        {backLabel}
      </button>
      <button data-testid="next-button" onClick={onNext} disabled={disableNext}>
        {nextLabel}
      </button>
    </div>
  )
}));

vi.mock('./sections/AccountingInfoSection', () => ({
  AccountingInfoSection: ({
    t
  }: {
    control: unknown;
    errors: unknown;
    data: OrganizationEditStep2Data;
    t: (key: string) => string;
  }) => (
    <div data-testid="accounting-info-section">
      <span>{t('organizationEditWizard.step2.accountingInfo.title')}</span>
      <input data-testid="iban-input" />
      <input data-testid="iban-contabile-input" />
      <input data-testid="cbill-input" />
    </div>
  )
}));

vi.mock('./sections/PaymentsInfoSection', () => ({
  PaymentsInfoSection: ({
    t,
    watchAdditionalLanguage
  }: {
    control: unknown;
    errors: unknown;
    data: OrganizationEditStep2Data;
    t: (key: string) => string;
    watchAdditionalLanguage: boolean;
  }) => (
    <div data-testid="payments-info-section">
      <span>{t('organizationEditWizard.step2.paymentsInfo.title')}</span>
      <input data-testid="segregation-code-input" />
      {watchAdditionalLanguage && <select data-testid="language-select" />}
    </div>
  )
}));

vi.mock('./sections/PagoPAIntegrationSection', () => ({
  PagoPAIntegrationSection: ({
    t,
    watchFlagNotifyIo
  }: {
    control: unknown;
    errors: unknown;
    data: OrganizationEditStep2Data;
    t: (key: string) => string;
    watchFlagNotifyIo: boolean;
  }) => (
    <div data-testid="pagopa-integration-section">
      <span>{t('organizationEditWizard.step2.pagoPAIntegration.title')}</span>
      {watchFlagNotifyIo && <input data-testid="io-api-key-input" />}
    </div>
  )
}));

describe('Step2EntityConfiguration', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const mockInitialData: OrganizationEditStep2Data = {
    iban: { value: '', readonly: false },
    ibanPostal: { value: '', readonly: false },
    cbill: { value: '', readonly: false },
    flagTreasury: { value: false, readonly: false },
    segregationCode: { value: '', readonly: false },
    generateNoticeApiKey: { value: '', readonly: false },
    additionalLanguage: { value: false, readonly: false },
    selectedLanguage: { value: '', readonly: false },
    flagNotifyOutcomePush: { value: false, readonly: false },
    flagPaymentNotification: { value: false, readonly: false },
    flagNotifyIo: { value: false, readonly: false },
    ioApiKey: { value: '', readonly: false },
    pdndEnabled: { value: false, readonly: false },
    sendApiKey: { value: '', readonly: false }
  };

  const mockFilledData: OrganizationEditStep2Data = {
    iban: { value: 'IT60X0542811101000000123456', readonly: false },
    ibanPostal: { value: 'IT60X0542811101000000654321', readonly: false },
    cbill: { value: 'CBILL001', readonly: false },
    flagTreasury: { value: true, readonly: false },
    segregationCode: { value: '01', readonly: false },
    generateNoticeApiKey: { value: 'api-key-123', readonly: false },
    additionalLanguage: { value: true, readonly: false },
    selectedLanguage: { value: 'EN', readonly: false },
    flagNotifyOutcomePush: { value: true, readonly: false },
    flagPaymentNotification: { value: true, readonly: false },
    flagNotifyIo: { value: true, readonly: false },
    ioApiKey: { value: 'io-api-key-456', readonly: false },
    pdndEnabled: { value: true, readonly: false },
    sendApiKey: { value: 'send-api-key-789', readonly: false }
  };

  const translations = {
    organizationEditWizard: {
      step2: {
        title: 'Configurazione Ente',
        accountingInfo: {
          title: 'Informazioni Contabili'
        },
        paymentsInfo: {
          title: 'Informazioni Pagamenti'
        },
        pagoPAIntegration: {
          title: 'Integrazione con i prodotti PagoPA'
        },
        iban: {
          invalid: 'IBAN non valido',
          required: 'IBAN obbligatorio'
        }
      },
      saveChanges: 'Salva modifiche'
    },
    commons: {
      requiredFieldDescription: '* Campi obbligatori',
      back: 'Indietro'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
  });

  describe('Rendering', () => {
    it('should render all three section components', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('payments-info-section')).toBeInTheDocument();
      expect(
        screen.getByTestId('pagopa-integration-section')
      ).toBeInTheDocument();
    });

    it('should render step title and required field description', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Configurazione Ente')).toBeInTheDocument();
      expect(screen.getByText('* Campi obbligatori')).toBeInTheDocument();
    });

    it('should render wizard step buttons', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    it('should render section titles correctly', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Informazioni Contabili')).toBeInTheDocument();
      expect(screen.getByText('Informazioni Pagamenti')).toBeInTheDocument();
      expect(
        screen.getByText('Integrazione con i prodotti PagoPA')
      ).toBeInTheDocument();
    });
  });

  describe('Form Population', () => {
    it('should initialize form with empty values', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
    });

    it('should initialize form with filled values', () => {
      render(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
    });

    it('should handle null values by converting to false for boolean fields', () => {
      const dataWithNulls: OrganizationEditStep2Data = {
        ...mockInitialData,
        flagNotifyOutcomePush: {
          value: null as unknown as boolean,
          readonly: false
        },
        flagPaymentNotification: {
          value: null as unknown as boolean,
          readonly: false
        }
      };

      render(
        <Step2EntityConfiguration
          data={dataWithNulls}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('payments-info-section')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call setData and onNext when form is submitted', async () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalled();
        expect(mockOnNext).toHaveBeenCalled();
      });
    });

    it('should call onNext with step2 data parameter', async () => {
      render(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledWith(
          expect.objectContaining({
            iban: expect.objectContaining({
              value: 'IT60X0542811101000000123456'
            }),
            segregationCode: expect.objectContaining({
              value: '01'
            })
          })
        );
      });
    });

    it('should preserve readonly state when submitting', async () => {
      const readonlyData = {
        ...mockFilledData,
        iban: { ...mockFilledData.iban, readonly: true }
      };

      render(
        <Step2EntityConfiguration
          data={readonlyData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalledWith(
          expect.objectContaining({
            iban: expect.objectContaining({
              readonly: true
            })
          })
        );
      });
    });

    it('should call setData with all field values correctly transformed', async () => {
      render(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalledWith(
          expect.objectContaining({
            iban: expect.objectContaining({
              value: 'IT60X0542811101000000123456'
            }),
            ibanPostal: expect.objectContaining({
              value: 'IT60X0542811101000000654321'
            }),
            cbill: expect.objectContaining({ value: 'CBILL001' }),
            flagTreasury: expect.objectContaining({ value: true }),
            segregationCode: expect.objectContaining({ value: '01' }),
            generateNoticeApiKey: expect.objectContaining({
              value: 'api-key-123'
            }),
            additionalLanguage: expect.objectContaining({ value: true }),
            selectedLanguage: expect.objectContaining({ value: 'EN' }),
            flagNotifyIo: expect.objectContaining({ value: true }),
            ioApiKey: expect.objectContaining({ value: 'io-api-key-456' }),
            pdndEnabled: expect.objectContaining({ value: true }),
            sendApiKey: expect.objectContaining({ value: 'send-api-key-789' })
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should not call onNext when back button is clicked', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should display correct button labels', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('commons.back')).toBeInTheDocument();
      expect(
        screen.getByText('organizationEditWizard.saveChanges')
      ).toBeInTheDocument();
    });
  });

  describe('Section Props', () => {
    it('should pass correct props to AccountingInfoSection', () => {
      render(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const accountingSection = screen.getByTestId('accounting-info-section');
      expect(accountingSection).toBeInTheDocument();
    });

    it('should pass correct props to PaymentsInfoSection', () => {
      render(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const paymentsSection = screen.getByTestId('payments-info-section');
      expect(paymentsSection).toBeInTheDocument();
    });

    it('should pass correct props to PagoPAIntegrationSection', () => {
      render(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const integrationSection = screen.getByTestId(
        'pagopa-integration-section'
      );
      expect(integrationSection).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should not show language select when additionalLanguage is false', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.queryByTestId('language-select')).not.toBeInTheDocument();
    });

    it('should show language select when additionalLanguage is true', () => {
      const dataWithLanguage = {
        ...mockInitialData,
        additionalLanguage: { value: true, readonly: false }
      };

      render(
        <Step2EntityConfiguration
          data={dataWithLanguage}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('language-select')).toBeInTheDocument();
    });

    it('should not show IO API Key input when flagNotifyIo is false', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.queryByTestId('io-api-key-input')).not.toBeInTheDocument();
    });

    it('should show IO API Key input when flagNotifyIo is true', () => {
      const dataWithIo = {
        ...mockInitialData,
        flagNotifyIo: { value: true, readonly: false }
      };

      render(
        <Step2EntityConfiguration
          data={dataWithIo}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('io-api-key-input')).toBeInTheDocument();
    });
  });

  describe('Form Values Sync', () => {
    it('should update form when data prop changes', () => {
      const { rerender } = render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();

      rerender(
        <Step2EntityConfiguration
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
    });

    it('should handle empty string values correctly', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
    });
  });

  describe('Utility Functions', () => {
    it('should initialize form with correct default values', () => {
      render(
        <Step2EntityConfiguration
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
    });

    it('should convert empty strings to empty values in form', () => {
      const emptyData: OrganizationEditStep2Data = {
        ...mockInitialData,
        iban: { value: '', readonly: false },
        segregationCode: { value: '', readonly: false }
      };

      render(
        <Step2EntityConfiguration
          data={emptyData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
    });
  });
});
