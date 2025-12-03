import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { EntityProfileSection } from './EntityProfileSection';
import {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../../models/OrganizationEditTypes';
import { i18nTestSetup } from '../../../../../../__tests__/i18nTestSetup';

vi.mock('../../../../../../utils/fieldValidation', () => ({
  isValidEmail: vi.fn((email: string) => {
    if (!email) return true;
    return email.includes('@');
  })
}));

vi.mock('../../../../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledFileUploader: ({
      name,
      disabled
    }: {
      name: string;
      control: unknown;
      description: string;
      fileExtensionsAllowed: Array<string>;
      disabled: boolean;
      header: JSX.Element;
    }) => (
      <div data-testid="logo-uploader">
        <span data-testid="logo-uploader-name">{name}</span>
        <span data-testid="logo-uploader-disabled">
          {disabled ? 'disabled' : 'enabled'}
        </span>
      </div>
    )
  }
}));

const TestWrapper = ({
  data,
  defaultValues,
  t
}: {
  data: UnifiedFormData;
  defaultValues: Partial<UnifiedFormValues>;
  t: (key: string) => string;
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UnifiedFormValues>({
    defaultValues: defaultValues as UnifiedFormValues,
    mode: 'onSubmit'
  });

  const onSubmit = () => {
    // no-op, we only care about triggering validation
  };

  return (
    <>
      <EntityProfileSection
        control={control}
        errors={errors}
        data={data}
        t={t}
      />
      <button
        type="button"
        data-testid="submit-entity-profile"
        onClick={handleSubmit(onSubmit)}
      >
        Submit
      </button>
    </>
  );
};

describe('EntityProfileSection', () => {
  const mockT = vi.fn((key: string) => key);

  const baseData: UnifiedFormData = {
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
    generateNoticeApiKey: { value: '', readonly: false },
    additionalLanguage: { value: false, readonly: false },
    selectedLanguage: { value: '', readonly: false },
    flagNotifyOutcomePush: { value: false, readonly: false },
    flagPaymentNotification: { value: false, readonly: false },
    // Step 2 PagoPA Integration fields
    flagNotifyIo: { value: false, readonly: false },
    ioApiKey: { value: '', readonly: false },
    pdndEnabled: { value: false, readonly: false },
    sendApiKey: { value: '', readonly: false },
    organizationStatus: 'DRAFT'
  };

  const defaultFormValues: Partial<UnifiedFormValues> = {
    orgName: '',
    orgFiscalCode: '',
    orgEmail: '',
    orgLogo: null,
    iban: '',
    ibanPostal: '',
    cbill: '',
    flagTreasury: false,
    segregationCode: '',
    generateNoticeApiKey: '',
    additionalLanguage: false,
    selectedLanguage: '',
    flagNotifyOutcomePush: false,
    flagPaymentNotification: false,
    flagNotifyIo: false,
    ioApiKey: '',
    pdndEnabled: false,
    sendApiKey: ''
  };

  const translations = {
    organizationEditWizard: {
      step1: {
        title: 'Anagrafica Ente',
        orgName: {
          label: 'Nome ente',
          placeholder: 'Inserisci il nome ente'
        },
        orgFiscalCode: {
          label: 'Codice fiscale ente',
          placeholder: 'Inserisci il codice fiscale'
        },
        orgEmail: {
          label: 'Email ente',
          helperText: 'Email di contatto ente',
          invalid: 'Email non valida'
        },
        orgLogo: {
          title: 'Logo servizio',
          description: 'Carica il logo del servizio',
          optional: 'Opzionale',
          uploadDescription: 'Carica un file immagine',
          required: 'Il logo è obbligatorio',
          learnMore: 'Scopri di più',
          requirements: 'Requisiti del logo'
        }
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
  });

  describe('Rendering', () => {
    it('should render section title and fields', () => {
      render(
        <TestWrapper
          data={baseData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(
        screen.getByText('organizationEditWizard.step1.title')
      ).toBeInTheDocument();
      expect(screen.getByTestId('org-name-field')).toBeInTheDocument();
      expect(screen.getByTestId('org-fiscal-code-field')).toBeInTheDocument();
      expect(screen.getByTestId('org-email-field')).toBeInTheDocument();
      expect(screen.getByTestId('logo-uploader')).toBeInTheDocument();
    });

    it('should render logo description, requirements and learn more link', () => {
      render(
        <TestWrapper
          data={baseData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(
        screen.getByText('organizationEditWizard.step1.orgLogo.description')
      ).toBeInTheDocument();
      expect(
        screen.getByText('organizationEditWizard.step1.orgLogo.requirements')
      ).toBeInTheDocument();
      expect(
        screen.getByText('organizationEditWizard.step1.orgLogo.learnMore')
      ).toBeInTheDocument();
    });

    it('should handle learn more click without errors', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());

      render(
        <TestWrapper
          data={baseData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const learnMoreLink = screen.getByText(
        'organizationEditWizard.step1.orgLogo.learnMore'
      );
      fireEvent.click(learnMoreLink);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Readonly and disabled behavior', () => {
    it('should disable orgName field when readonly is true or value is present', () => {
      const dataWithReadonly: UnifiedFormData = {
        ...baseData,
        orgName: { value: 'Existing Name', readonly: true }
      };

      render(
        <TestWrapper
          data={dataWithReadonly}
          defaultValues={{
            ...defaultFormValues,
            orgName: 'Existing Name'
          }}
          t={mockT}
        />
      );

      const orgNameInput = screen
        .getByTestId('org-name-field')
        .querySelector('input');
      expect(orgNameInput).toBeDisabled();
    });

    it('should disable orgFiscalCode field when readonly is true or value is present', () => {
      const dataWithReadonly: UnifiedFormData = {
        ...baseData,
        orgFiscalCode: { value: 'CF123', readonly: true }
      };

      render(
        <TestWrapper
          data={dataWithReadonly}
          defaultValues={{
            ...defaultFormValues,
            orgFiscalCode: 'CF123'
          }}
          t={mockT}
        />
      );

      const fiscalCodeInput = screen
        .getByTestId('org-fiscal-code-field')
        .querySelector('input');
      expect(fiscalCodeInput).toBeDisabled();
    });

    it('should always disable orgEmail field', () => {
      render(
        <TestWrapper
          data={baseData}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const emailInput = screen
        .getByTestId('org-email-field')
        .querySelector('input');
      expect(emailInput).toBeDisabled();
    });

    it('should disable logo uploader when orgLogo is readonly', () => {
      const dataWithReadonlyLogo: UnifiedFormData = {
        ...baseData,
        orgLogo: { value: 'data:image/png;base64,logo', readonly: true }
      };

      render(
        <TestWrapper
          data={dataWithReadonlyLogo}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(screen.getByTestId('logo-uploader-disabled')).toHaveTextContent(
        'disabled'
      );
    });
  });

  describe('Logo optional label', () => {
    it('should show optional label when organization status is not ACTIVE', () => {
      const dataDraft: UnifiedFormData = {
        ...baseData,
        organizationStatus: 'DRAFT'
      };

      render(
        <TestWrapper
          data={dataDraft}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      const optionalTextElements = screen.queryAllByText(
        (_content, element) => {
          if (!element) return false;
          const textContent = element.textContent || '';
          return textContent.includes(
            'organizationEditWizard.step1.orgLogo.optional'
          );
        }
      );
      expect(optionalTextElements.length).toBeGreaterThan(0);
    });

    it('should not show optional label when organization status is ACTIVE', () => {
      const dataActive: UnifiedFormData = {
        ...baseData,
        organizationStatus: 'ACTIVE'
      };

      render(
        <TestWrapper
          data={dataActive}
          defaultValues={defaultFormValues}
          t={mockT}
        />
      );

      expect(
        screen.queryByText('organizationEditWizard.step1.orgLogo.optional')
      ).not.toBeInTheDocument();
    });
  });

  describe('Email validation', () => {
    it('should show error message when email is invalid', async () => {
      const dataWithEmail: UnifiedFormData = {
        ...baseData,
        orgEmail: { value: 'invalid-email', readonly: false }
      };

      render(
        <TestWrapper
          data={dataWithEmail}
          defaultValues={{
            ...defaultFormValues,
            orgEmail: 'invalid-email'
          }}
          t={mockT}
        />
      );

      const submitButton = screen.getByTestId('submit-entity-profile');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const emailField = screen.getByTestId('org-email-field');
        const helperText = emailField.parentElement?.querySelector(
          '.MuiFormHelperText-root'
        );

        expect(helperText).toBeInTheDocument();
        expect(helperText).toHaveTextContent(
          'organizationEditWizard.step1.orgEmail.invalid'
        );
      });
    });
  });
});
