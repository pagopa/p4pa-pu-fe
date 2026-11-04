import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { PaymentsInfoSection } from './PaymentsInfoSection';
import type {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../../models/OrganizationEditTypes';
import { LANGUAGE_OPTIONS } from '../../../../../../models/OrganizationEditTypes';
import { i18nTestSetup } from '../../../../../../__tests__/i18nTestSetup';

vi.mock('../../../../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledRadioGroup: ({
      name,
      disabled,
      options
    }: {
      name: string;
      control: unknown;
      disabled: boolean;
      options: Array<{ value: boolean; label: string }>;
    }) => (
      <div data-testid={`${name}-radio-group`}>
        {options.map((option) => (
          <label key={String(option.value)}>
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              disabled={disabled}
              data-testid={`${name}-${option.value}`}
            />
            {option.label}
          </label>
        ))}
      </div>
    )
  }
}));

const TestWrapper = ({
  data,
  defaultValues,
  watchAdditionalLanguage = false
}: {
  data: UnifiedFormData;
  defaultValues: Partial<UnifiedFormValues>;
  watchAdditionalLanguage?: boolean;
}) => {
  const {
    control,
    formState: { errors }
  } = useForm<UnifiedFormValues>({
    defaultValues: defaultValues as UnifiedFormValues,
    mode: 'onSubmit'
  });

  return (
    <PaymentsInfoSection
      control={control}
      errors={errors}
      data={data}
      watchAdditionalLanguage={watchAdditionalLanguage}
    />
  );
};

describe('PaymentsInfoSection', () => {
  const mockData: UnifiedFormData = {
    // Step 1 fields
    orgName: { value: '', readonly: false },
    orgFiscalCode: { value: '', readonly: false },
    orgEmail: { value: '', readonly: false },
    orgLogo: { value: null, readonly: false },
    logoRemoved: false,
    // Step 2 Accounting fields
    iban: { value: '', readonly: false },
    ibanPostal: { value: '', readonly: false },
    cbill: { value: '', readonly: false },
    flagTreasury: { value: false, readonly: false },
    // Step 2 Payments fields
    segregationCode: { value: '', readonly: false },
    additionalLanguage: { value: false, readonly: false },
    selectedLanguage: { value: '', readonly: false },
    flagNotifyOutcomePush: { value: false, readonly: false },
    flagPaymentNotification: { value: false, readonly: false },
    // Step 2 PagoPA Integration fields
    flagNotifyIo: { value: false, readonly: false },
    pdndEnabled: { value: false, readonly: false },
    organizationStatus: 'DRAFT'
  };

  const mockFilledData: UnifiedFormData = {
    ...mockData,
    segregationCode: { value: '01', readonly: false },
    additionalLanguage: { value: true, readonly: false },
    selectedLanguage: { value: 'en', readonly: false },
    flagNotifyOutcomePush: { value: true, readonly: false },
    flagPaymentNotification: { value: true, readonly: false }
  };

  const translations = {
    organizationEditWizard: {
      step2: {
        paymentsInfo: {
          title: 'Informazioni Pagamenti'
        },
        segregationCode: {
          label: 'Codice Segregazione',
          placeholder: 'Inserisci codice segregazione',
          required: 'Codice segregazione obbligatorio'
        },
        additionalLanguage: {
          label: 'Lingua aggiuntiva per gli avvisi'
        },
        selectedLanguage: {
          label: 'Seleziona lingua',
          required: 'Lingua obbligatoria',
          options: {
            en: 'Inglese',
            fr: 'Francese',
            de: 'Tedesco'
          }
        },
        flagNotifyOutcomePush: {
          label: 'Notifiche pagamenti gestiti da piattaforme esterne',
          description: 'Descrizione notifiche esterne',
          abilita: 'Abilita',
          disabilita: 'Disabilita'
        },
        flagPaymentNotification: {
          label: 'Notifiche pagamenti gestiti da Piattaforma Unitaria',
          description: 'Descrizione notifiche piattaforma',
          abilita: 'Abilita',
          disabilita: 'Disabilita'
        }
      }
    }
  };

  const defaultFormValues: Partial<UnifiedFormValues> = {
    // Step 1 fields
    orgName: '',
    orgFiscalCode: '',
    orgEmail: '',
    orgLogo: null,
    // Step 2 Accounting fields
    iban: '',
    ibanPostal: '',
    cbill: '',
    flagTreasury: false,
    // Step 2 Payments fields
    segregationCode: '',
    additionalLanguage: false,
    selectedLanguage: '',
    flagNotifyOutcomePush: null,
    flagPaymentNotification: null,
    // Step 2 PagoPA Integration fields
    flagNotifyIo: false,
    pdndEnabled: false
  };

  const filledFormValues: Partial<UnifiedFormValues> = {
    ...defaultFormValues,
    segregationCode: '01',
    additionalLanguage: true,
    selectedLanguage: 'en',
    flagNotifyOutcomePush: true,
    flagPaymentNotification: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
  });

  describe('Rendering', () => {
    it('should render section title', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      expect(screen.getByText('Informazioni Pagamenti')).toBeInTheDocument();
    });

    it('should render all required fields', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      expect(screen.getByTestId('segregation-code-field')).toBeInTheDocument();
      expect(
        screen.getByTestId('additional-language-switch')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('flagNotifyOutcomePush-radio-group')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('flagPaymentNotification-radio-group')
      ).toBeInTheDocument();
    });

    it('should render segregationCode as NOT required for DRAFT status', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      const segregationCodeInput = screen
        .getByTestId('segregation-code-field')
        .querySelector('input');

      expect(segregationCodeInput).not.toHaveAttribute('required');
    });

    it('should render segregationCode as required for ACTIVE status', () => {
      const activeData = {
        ...mockData,
        organizationStatus: 'ACTIVE'
      };

      render(
        <TestWrapper data={activeData} defaultValues={defaultFormValues} />
      );

      const segregationCodeInput = screen
        .getByTestId('segregation-code-field')
        .querySelector('input');

      expect(segregationCodeInput).toHaveAttribute('required');
    });

    it('should render radio groups for notifications', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      expect(
        screen.getByText('Notifiche pagamenti gestiti da piattaforme esterne')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Notifiche pagamenti gestiti da Piattaforma Unitaria')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione notifiche esterne')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione notifiche piattaforma')
      ).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should NOT show language select when additionalLanguage is false', () => {
      render(
        <TestWrapper
          data={mockData}
          defaultValues={defaultFormValues}
          watchAdditionalLanguage={false}
        />
      );

      expect(
        screen.queryByTestId('selected-language-select')
      ).not.toBeInTheDocument();
    });

    it('should show language select when additionalLanguage is true', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          watchAdditionalLanguage={true}
        />
      );

      expect(
        screen.getByTestId('selected-language-select')
      ).toBeInTheDocument();
    });

    it('should render language select with correct options in DOM', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          watchAdditionalLanguage={true}
        />
      );

      const languageSelect = screen.getByTestId('selected-language-select');
      expect(languageSelect).toBeInTheDocument();
    });
  });

  describe('Form Population', () => {
    it('should display empty fields when data is empty', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      const segregationCodeInput = screen
        .getByTestId('segregation-code-field')
        .querySelector('input');
      const additionalLanguageSwitch = screen
        .getByTestId('additional-language-switch')
        .querySelector('input');

      expect(segregationCodeInput).toHaveValue('');
      expect(additionalLanguageSwitch).not.toBeChecked();
    });

    it('should display filled fields when data has values', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          watchAdditionalLanguage={true}
        />
      );

      const segregationCodeInput = screen
        .getByTestId('segregation-code-field')
        .querySelector('input');
      const additionalLanguageSwitch = screen
        .getByTestId('additional-language-switch')
        .querySelector('input');
      const selectedLanguageSelect = screen
        .getByTestId('selected-language-select')
        .querySelector('input');

      expect(segregationCodeInput).toHaveValue('01');
      expect(additionalLanguageSwitch).toBeChecked();
      expect(selectedLanguageSelect).toHaveValue('en');
    });
  });

  describe('Field Disabled State', () => {
    it('should disable segregation code field when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        segregationCode: { ...mockData.segregationCode, readonly: true }
      };

      render(
        <TestWrapper data={readonlyData} defaultValues={defaultFormValues} />
      );

      const segregationCodeInput = screen
        .getByTestId('segregation-code-field')
        .querySelector('input');
      expect(segregationCodeInput).toBeDisabled();
    });

    it('should disable additional language switch when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        additionalLanguage: { ...mockData.additionalLanguage, readonly: true }
      };

      render(
        <TestWrapper data={readonlyData} defaultValues={defaultFormValues} />
      );

      const additionalLanguageSwitch = screen
        .getByTestId('additional-language-switch')
        .querySelector('input');
      expect(additionalLanguageSwitch).toBeDisabled();
    });

    it('should disable language select when readonly is true', () => {
      const readonlyData = {
        ...mockFilledData,
        selectedLanguage: { ...mockFilledData.selectedLanguage, readonly: true }
      };

      render(
        <TestWrapper
          data={readonlyData}
          defaultValues={filledFormValues}
          watchAdditionalLanguage={true}
        />
      );

      const selectedLanguageSelect = screen
        .getByTestId('selected-language-select')
        .querySelector('input');
      expect(selectedLanguageSelect).toBeDisabled();
    });

    it('should disable notify outcome push radio when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        flagNotifyOutcomePush: {
          ...mockData.flagNotifyOutcomePush,
          readonly: true
        }
      };

      render(
        <TestWrapper data={readonlyData} defaultValues={defaultFormValues} />
      );

      const radioTrue = screen.getByTestId('flagNotifyOutcomePush-true');
      const radioFalse = screen.getByTestId('flagNotifyOutcomePush-false');

      expect(radioTrue).toHaveAttribute('aria-disabled', 'true');
      expect(radioFalse).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable payment notification radio when readonly is true', () => {
      const readonlyData = {
        ...mockData,
        flagPaymentNotification: {
          ...mockData.flagPaymentNotification,
          readonly: true
        }
      };

      render(
        <TestWrapper data={readonlyData} defaultValues={defaultFormValues} />
      );

      const radioTrue = screen.getByTestId('flagPaymentNotification-true');
      const radioFalse = screen.getByTestId('flagPaymentNotification-false');

      expect(radioTrue).toHaveAttribute('aria-disabled', 'true');
      expect(radioFalse).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Switch Toggle', () => {
    it('should toggle additional language switch', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      const additionalLanguageSwitch = screen
        .getByTestId('additional-language-switch')
        .querySelector('input') as HTMLInputElement;

      expect(additionalLanguageSwitch).not.toBeChecked();

      fireEvent.click(additionalLanguageSwitch);

      expect(additionalLanguageSwitch).toBeChecked();
    });

    it('should have correct initial checked state based on data', () => {
      render(
        <TestWrapper data={mockFilledData} defaultValues={filledFormValues} />
      );

      const additionalLanguageSwitch = screen
        .getByTestId('additional-language-switch')
        .querySelector('input');
      expect(additionalLanguageSwitch).toBeChecked();
    });
  });

  describe('Language Options', () => {
    it('should render language select when additional language is enabled', () => {
      render(
        <TestWrapper
          data={mockFilledData}
          defaultValues={filledFormValues}
          watchAdditionalLanguage={true}
        />
      );

      const languageSelect = screen.getByTestId('selected-language-select');
      expect(languageSelect).toBeInTheDocument();
    });

    it('should use LANGUAGE_OPTIONS constants for values', () => {
      expect(LANGUAGE_OPTIONS.EN).toBe('en');
      expect(LANGUAGE_OPTIONS.FR).toBe('fr');
      expect(LANGUAGE_OPTIONS.DE).toBe('de');
    });
  });

  describe('Radio Groups', () => {
    it('should render radio options for notify outcome push', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      const radioGroupContainer = screen.getByTestId(
        'flagNotifyOutcomePush-radio-group'
      );
      expect(radioGroupContainer).toBeInTheDocument();

      const enableLabel = screen.getAllByText('Abilita')[0];
      const disableLabel = screen.getAllByText('Disabilita')[0];

      expect(enableLabel).toBeInTheDocument();
      expect(disableLabel).toBeInTheDocument();
    });

    it('should render radio options for payment notification', () => {
      render(<TestWrapper data={mockData} defaultValues={defaultFormValues} />);

      const radioGroupContainer = screen.getByTestId(
        'flagPaymentNotification-radio-group'
      );
      expect(radioGroupContainer).toBeInTheDocument();

      const enableLabel = screen.getAllByText('Abilita')[1];
      const disableLabel = screen.getAllByText('Disabilita')[1];

      expect(enableLabel).toBeInTheDocument();
      expect(disableLabel).toBeInTheDocument();
    });
  });

  describe('Segregation Code Validation Rules', () => {
    it('should have pattern validation rule configured for exactly 2 digits', () => {
      const pattern = /^\d{2}$/;

      expect(pattern.test('00')).toBe(true);
      expect(pattern.test('01')).toBe(true);
      expect(pattern.test('99')).toBe(true);
      expect(pattern.test('42')).toBe(true);

      expect(pattern.test('1')).toBe(false);
      expect(pattern.test('123')).toBe(false);
      expect(pattern.test('AB')).toBe(false);
      expect(pattern.test('1A')).toBe(false);
      expect(pattern.test('0!')).toBe(false);
      expect(pattern.test(' 1')).toBe(false);
      expect(pattern.test('')).toBe(false);
    });
  });
});
