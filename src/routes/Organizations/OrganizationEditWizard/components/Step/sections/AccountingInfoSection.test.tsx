import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { AccountingInfoSection } from './AccountingInfoSection';
import {
  OrganizationEditStep2Data,
  Step2FormValues
} from '../../../../../../models/OrganizationEditTypes';
import { i18nTestSetup } from '../../../../../../__tests__/i18nTestSetup';

vi.mock('../../../../../../utils/fieldValidation', () => ({
  isValidIBAN: vi.fn((iban: string) => {
    if (!iban) return true;
    return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban);
  })
}));

const TestWrapper = ({
  data,
  defaultValues,
  createIBANValidationRules,
  t
}: {
  data: OrganizationEditStep2Data;
  defaultValues: Partial<Step2FormValues>;
  createIBANValidationRules: (
    t: (key: string) => string,
    isRequired?: boolean
  ) => Record<string, unknown>;
  t: (key: string) => string;
}) => {
  const {
    control,
    formState: { errors }
  } = useForm<Step2FormValues>({
    defaultValues: defaultValues as Step2FormValues,
    mode: 'onSubmit'
  });

  return (
    <AccountingInfoSection
      control={control}
      errors={errors}
      data={data}
      t={t}
      createIBANValidationRules={createIBANValidationRules}
    />
  );
};

describe('AccountingInfoSection', () => {
  const mockT = vi.fn((key: string) => key);
  const mockCreateIBANValidationRules = vi.fn(
    (isRequired = false): Record<string, unknown> => {
      const rules: Record<string, unknown> = {
        validate: {
          validIBAN: (value: string): string => {
            if (!value) return isRequired ? 'IBAN obbligatorio' : '';
            return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(value)
              ? ''
              : 'IBAN non valido';
          }
        }
      };

      if (isRequired) {
        rules.required = {
          value: true,
          message: 'IBAN obbligatorio'
        };
      }

      return rules;
    }
  );

  const mockData: OrganizationEditStep2Data = {
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
    ...mockData,
    iban: { value: 'IT60X0542811101000000123456', readonly: false },
    ibanPostal: { value: 'IT60X0542811101000000654321', readonly: false },
    cbill: { value: 'CBILL001', readonly: false },
    flagTreasury: { value: true, readonly: false }
  };

  const translations = {
    organizationEditWizard: {
      step2: {
        accountingInfo: {
          title: 'Informazioni Contabili'
        },
        iban: {
          label: 'IBAN',
          placeholder: 'IT00X0000000000000000000000',
          invalid: 'IBAN non valido',
          required: 'IBAN obbligatorio'
        },
        ibanPostal: {
          label: 'IBAN Postale',
          placeholder: 'IT00X0000000000000000000000'
        },
        cbill: {
          label: 'Codice CBILL',
          placeholder: 'Inserisci il codice CBILL'
        },
        integratedCashJournal: {
          label: 'Giornale di cassa integrato'
        }
      }
    }
  };

  const defaultFormValues: Partial<Step2FormValues> = {
    iban: '',
    ibanPostal: '',
    cbill: '',
    flagTreasury: false
  };

  const filledFormValues: Partial<Step2FormValues> = {
    iban: 'IT60X0542811101000000123456',
    ibanPostal: 'IT60X0542811101000000654321',
    cbill: 'CBILL001',
    flagTreasury: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
    mockT.mockImplementation((key: string) => {
      const keys: Record<string, string> = {
        'organizationEditWizard.step2.accountingInfo.title':
          'Informazioni Contabili',
        'organizationEditWizard.step2.iban.label': 'IBAN',
        'organizationEditWizard.step2.iban.placeholder':
          'IT00X0000000000000000000000',
        'organizationEditWizard.step2.iban.invalid': 'IBAN non valido',
        'organizationEditWizard.step2.iban.required': 'IBAN obbligatorio',
        'organizationEditWizard.step2.ibanPostal.label': 'IBAN Postale',
        'organizationEditWizard.step2.ibanPostal.placeholder':
          'IT00X0000000000000000000000',
        'organizationEditWizard.step2.cbill.label': 'Codice CBILL',
        'organizationEditWizard.step2.cbill.placeholder':
          'Inserisci il codice CBILL',
        'organizationEditWizard.step2.integratedCashJournal.label':
          'Giornale di cassa integrato'
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
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(screen.getByText('Informazioni Contabili')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(screen.getByTestId('iban-field')).toBeInTheDocument();
      expect(screen.getByTestId('iban-postal-field')).toBeInTheDocument();
      expect(screen.getByTestId('cbill-field')).toBeInTheDocument();
      expect(screen.getByTestId('flag-treasury-switch')).toBeInTheDocument();
    });

    it('should render IBAN field with required attribute', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const ibanField = screen.getByTestId('iban-field').querySelector('input');
      expect(ibanField).toHaveAttribute('required');
    });

    it('should render field labels correctly', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(screen.getAllByText('IBAN').length).toBeGreaterThan(0);
      expect(screen.getAllByText('IBAN Postale').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Codice CBILL').length).toBeGreaterThan(0);
      expect(
        screen.getByText('Giornale di cassa integrato')
      ).toBeInTheDocument();
    });
  });

  describe('Form Population', () => {
    it('should display empty fields when data is empty', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const ibanInput = screen.getByTestId('iban-field').querySelector('input');
      const ibanPostalInput = screen
        .getByTestId('iban-postal-field')
        .querySelector('input');
      const cbillInput = screen
        .getByTestId('cbill-field')
        .querySelector('input');
      const flagTreasurySwitch = screen
        .getByTestId('flag-treasury-switch')
        .querySelector('input');

      expect(ibanInput).toHaveValue('');
      expect(ibanPostalInput).toHaveValue('');
      expect(cbillInput).toHaveValue('');
      expect(flagTreasurySwitch).not.toBeChecked();
    });

    it('should display filled fields when data has values', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const ibanInput = screen.getByTestId('iban-field').querySelector('input');
      const ibanPostalInput = screen
        .getByTestId('iban-postal-field')
        .querySelector('input');
      const cbillInput = screen
        .getByTestId('cbill-field')
        .querySelector('input');
      const flagTreasurySwitch = screen
        .getByTestId('flag-treasury-switch')
        .querySelector('input');

      expect(ibanInput).toHaveValue('IT60X0542811101000000123456');
      expect(ibanPostalInput).toHaveValue('IT60X0542811101000000654321');
      expect(cbillInput).toHaveValue('CBILL001');
      expect(flagTreasurySwitch).toBeChecked();
    });
  });

  describe('Field Disabled State', () => {
    it('should disable IBAN field when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        iban: { ...mockData.iban, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const ibanInput = screen.getByTestId('iban-field').querySelector('input');
      expect(ibanInput).toBeDisabled();
    });

    it('should disable IBAN Postale field when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        ibanPostal: { ...mockData.ibanPostal, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const ibanPostalInput = screen
        .getByTestId('iban-postal-field')
        .querySelector('input');
      expect(ibanPostalInput).toBeDisabled();
    });

    it('should disable CBILL field when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        cbill: { ...mockData.cbill, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const cbillInput = screen
        .getByTestId('cbill-field')
        .querySelector('input');
      expect(cbillInput).toBeDisabled();
    });

    it('should disable flag treasury switch when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        flagTreasury: { ...mockData.flagTreasury, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const flagTreasurySwitch = screen
        .getByTestId('flag-treasury-switch')
        .querySelector('input');
      expect(flagTreasurySwitch).toBeDisabled();
    });
  });

  describe('Validation Rules', () => {
    it('should call createIBANValidationRules for IBAN field with required=true', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(mockCreateIBANValidationRules).toHaveBeenCalledWith(mockT, true);
    });

    it('should call createIBANValidationRules for IBAN Postale field with required=false', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(mockCreateIBANValidationRules).toHaveBeenCalledWith(mockT, false);
    });

    it('should call createIBANValidationRules exactly 2 times', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(mockCreateIBANValidationRules).toHaveBeenCalledTimes(2);
    });
  });

  describe('Switch Toggle', () => {
    it('should toggle flag treasury switch', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const flagTreasurySwitch = screen
        .getByTestId('flag-treasury-switch')
        .querySelector('input') as HTMLInputElement;

      expect(flagTreasurySwitch).not.toBeChecked();

      fireEvent.click(flagTreasurySwitch);

      expect(flagTreasurySwitch).toBeChecked();
    });

    it('should have correct initial checked state based on data', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      const flagTreasurySwitch = screen
        .getByTestId('flag-treasury-switch')
        .querySelector('input');
      expect(flagTreasurySwitch).toBeChecked();
    });
  });

  describe('Translation Function', () => {
    it('should call translation function with correct keys', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          createIBANValidationRules={mockCreateIBANValidationRules}
          t={mockT}
        />
      );

      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.accountingInfo.title'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.iban.label'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.iban.placeholder'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.ibanPostal.label'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.cbill.label'
      );
      expect(mockT).toHaveBeenCalledWith(
        'organizationEditWizard.step2.integratedCashJournal.label'
      );
    });
  });
});
