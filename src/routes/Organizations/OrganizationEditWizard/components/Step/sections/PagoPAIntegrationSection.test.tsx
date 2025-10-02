import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { PagoPAIntegrationSection } from './PagoPAIntegrationSection';
import {
  OrganizationEditStep2Data,
  Step2FormValues
} from '../../../../../../models/OrganizationEditTypes';
import { i18nTestSetup } from '../../../../../../__tests__/i18nTestSetup';

vi.mock('../../../../../../assets/appio.svg', () => ({
  default: () => <div data-testid="appio-icon">IO Icon</div>
}));

vi.mock('../../../../../../assets/send.svg', () => ({
  default: () => <div data-testid="send-icon">SEND Icon</div>
}));

const TestWrapper = ({
  data,
  defaultValues,
  t,
  watchFlagNotifyIo = false
}: {
  data: OrganizationEditStep2Data;
  defaultValues: Partial<Step2FormValues>;
  t: (key: string) => string;
  watchFlagNotifyIo?: boolean;
}) => {
  const {
    control,
    formState: { errors }
  } = useForm<Step2FormValues>({
    defaultValues: defaultValues as Step2FormValues,
    mode: 'onSubmit'
  });

  return (
    <PagoPAIntegrationSection
      control={control}
      errors={errors}
      data={data}
      t={t}
      watchFlagNotifyIo={watchFlagNotifyIo}
    />
  );
};

describe('PagoPAIntegrationSection', () => {
  const mockT = vi.fn((key: string) => key);

  const mockData: OrganizationEditStep2Data = {
    iban: { value: '', readonly: false },
    ibanContabile: { value: '', readonly: false },
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
    ...mockData,
    flagNotifyIo: { value: true, readonly: false },
    ioApiKey: { value: 'io-api-key-123', readonly: false },
    pdndEnabled: { value: true, readonly: false },
    sendApiKey: { value: 'send-api-key-456', readonly: false }
  };

  const translations = {
    organizationEditWizard: {
      step2: {
        pagoPaIntegration: {
          title: 'Integrazione con i prodotti PagoPA',
          io: {
            label: 'Abilita integrazione IO',
            description: 'Descrizione integrazione IO',
            apiKeyLabel: 'API Key IO',
            apiKeyPlaceholder: 'Inserisci API Key IO',
            apiKeyRequired: 'API Key IO obbligatoria',
            apiKeyHelperText: 'Helper text API Key IO'
          },
          send: {
            label: 'Abilita integrazione SEND',
            description: 'Descrizione integrazione SEND',
            apiKeyLabel: 'API Key SEND',
            apiKeyPlaceholder: 'Inserisci API Key SEND'
          }
        }
      }
    }
  };

  const defaultFormValues: Partial<Step2FormValues> = {
    flagNotifyIo: false,
    ioApiKey: '',
    pdndEnabled: false,
    sendApiKey: ''
  };

  const filledFormValues: Partial<Step2FormValues> = {
    flagNotifyIo: true,
    ioApiKey: 'io-api-key-123',
    pdndEnabled: true,
    sendApiKey: 'send-api-key-456'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
    mockT.mockImplementation((key: string) => {
      const keys: Record<string, string> = {
        'organizationEditWizard.step2.pagoPaIntegration.title':
          'Integrazione con i prodotti PagoPA',
        'organizationEditWizard.step2.pagoPaIntegration.io.label':
          'Abilita integrazione IO',
        'organizationEditWizard.step2.pagoPaIntegration.io.description':
          'Descrizione integrazione IO',
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyLabel':
          'API Key IO',
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyPlaceholder':
          'Inserisci API Key IO',
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyRequired':
          'API Key IO obbligatoria',
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyHelperText':
          'Helper text API Key IO',
        'organizationEditWizard.step2.pagoPaIntegration.send.label':
          'Abilita integrazione SEND',
        'organizationEditWizard.step2.pagoPaIntegration.send.description':
          'Descrizione integrazione SEND',
        'organizationEditWizard.step2.pagoPaIntegration.send.apiKeyLabel':
          'API Key SEND',
        'organizationEditWizard.step2.pagoPaIntegration.send.apiKeyPlaceholder':
          'Inserisci API Key SEND'
      };
      return keys[key] || key;
    });
  });

  describe('Rendering', () => {
    it('should render section title', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(
        screen.getByText('Integrazione con i prodotti PagoPA')
      ).toBeInTheDocument();
    });

    it('should render IO and SEND sections', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getByText('IO')).toBeInTheDocument();
      expect(screen.getByText('SEND')).toBeInTheDocument();
    });

    it('should render IO and SEND icons', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getByTestId('appio-icon')).toBeInTheDocument();
      expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    });

    it('should render IO and SEND switches', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getByTestId('flag-notify-io-switch')).toBeInTheDocument();
      expect(screen.getByTestId('pdnd-enabled-switch')).toBeInTheDocument();
    });

    it('should render SEND API Key field always', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getByTestId('send-api-key-field')).toBeInTheDocument();
    });

    it('should render section descriptions', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(
        screen.getByText('Descrizione integrazione IO')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione integrazione SEND')
      ).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should NOT show IO API Key field when flagNotifyIo is false', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
          watchFlagNotifyIo={false}
        />
      );

      expect(screen.queryByTestId('io-api-key-field')).not.toBeInTheDocument();
    });

    it('should show IO API Key field when flagNotifyIo is true', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      expect(screen.getByTestId('io-api-key-field')).toBeInTheDocument();
    });

    it('should show IO API Key field with required attribute when visible', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      const ioApiKeyInput = screen
        .getByTestId('io-api-key-field')
        .querySelector('input');
      expect(ioApiKeyInput).toHaveAttribute('required');
    });
  });

  describe('Form Population', () => {
    it('should display empty fields when data is empty', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const flagNotifyIoSwitch = screen
        .getByTestId('flag-notify-io-switch')
        .querySelector('input');
      const pdndEnabledSwitch = screen
        .getByTestId('pdnd-enabled-switch')
        .querySelector('input');
      const sendApiKeyInput = screen
        .getByTestId('send-api-key-field')
        .querySelector('input');

      expect(flagNotifyIoSwitch).not.toBeChecked();
      expect(pdndEnabledSwitch).not.toBeChecked();
      expect(sendApiKeyInput).toHaveValue('');
    });

    it('should display filled fields when data has values', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      const flagNotifyIoSwitch = screen
        .getByTestId('flag-notify-io-switch')
        .querySelector('input');
      const ioApiKeyInput = screen
        .getByTestId('io-api-key-field')
        .querySelector('input');
      const pdndEnabledSwitch = screen
        .getByTestId('pdnd-enabled-switch')
        .querySelector('input');
      const sendApiKeyInput = screen
        .getByTestId('send-api-key-field')
        .querySelector('input');

      expect(flagNotifyIoSwitch).toBeChecked();
      expect(ioApiKeyInput).toHaveValue('io-api-key-123');
      expect(pdndEnabledSwitch).toBeChecked();
      expect(sendApiKeyInput).toHaveValue('send-api-key-456');
    });
  });

  describe('Field Disabled State', () => {
    it('should disable IO switch when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        flagNotifyIo: { ...mockData.flagNotifyIo, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const flagNotifyIoSwitch = screen
        .getByTestId('flag-notify-io-switch')
        .querySelector('input');
      expect(flagNotifyIoSwitch).toBeDisabled();
    });

    it('should disable IO API Key field when readonly is true', () => {
      const readonlyData = {
        ...mockFilledData,
        ioApiKey: { ...mockFilledData.ioApiKey, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      const ioApiKeyInput = screen
        .getByTestId('io-api-key-field')
        .querySelector('input');
      expect(ioApiKeyInput).toBeDisabled();
    });

    it('should disable PDND switch when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        pdndEnabled: { ...mockData.pdndEnabled, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const pdndEnabledSwitch = screen
        .getByTestId('pdnd-enabled-switch')
        .querySelector('input');
      expect(pdndEnabledSwitch).toBeDisabled();
    });

    it('should disable SEND API Key field when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        sendApiKey: { ...mockData.sendApiKey, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const sendApiKeyInput = screen
        .getByTestId('send-api-key-field')
        .querySelector('input');
      expect(sendApiKeyInput).toBeDisabled();
    });
  });

  describe('Switch Toggle', () => {
    it('should toggle IO switch', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const flagNotifyIoSwitch = screen
        .getByTestId('flag-notify-io-switch')
        .querySelector('input') as HTMLInputElement;

      expect(flagNotifyIoSwitch).not.toBeChecked();

      fireEvent.click(flagNotifyIoSwitch);

      expect(flagNotifyIoSwitch).toBeChecked();
    });

    it('should toggle PDND switch', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const pdndEnabledSwitch = screen
        .getByTestId('pdnd-enabled-switch')
        .querySelector('input') as HTMLInputElement;

      expect(pdndEnabledSwitch).not.toBeChecked();

      fireEvent.click(pdndEnabledSwitch);

      expect(pdndEnabledSwitch).toBeChecked();
    });

    it('should have correct initial checked state for IO based on data', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      const flagNotifyIoSwitch = screen
        .getByTestId('flag-notify-io-switch')
        .querySelector('input');
      expect(flagNotifyIoSwitch).toBeChecked();
    });

    it('should have correct initial checked state for PDND based on data', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
        />
      );

      const pdndEnabledSwitch = screen
        .getByTestId('pdnd-enabled-switch')
        .querySelector('input');
      expect(pdndEnabledSwitch).toBeChecked();
    });
  });

  describe('Translation Function', () => {
    it('should call translation function with correct keys', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.title'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.io.label'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.io.description'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.send.label'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.send.description'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.send.apiKeyLabel'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.send.apiKeyPlaceholder'
      );
    });

    it('should call translation function for IO API Key when visible', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyLabel'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyPlaceholder'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyHelperText'
      );
    });
  });

  describe('Field Labels', () => {
    it('should render correct labels for switches', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getByText('Abilita integrazione IO')).toBeInTheDocument();
      expect(screen.getByText('Abilita integrazione SEND')).toBeInTheDocument();
    });

    it('should render correct label for SEND API Key field', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getAllByText('API Key SEND').length).toBeGreaterThan(0);
    });

    it('should render correct label for IO API Key field when visible', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      expect(screen.getAllByText('API Key IO').length).toBeGreaterThan(0);
    });
  });

  describe('Helper Text', () => {
    it('should display helper text for IO API Key when visible', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          t={mockT}
          watchFlagNotifyIo={true}
        />
      );

      expect(screen.getByText('Helper text API Key IO')).toBeInTheDocument();
    });
  });
});
