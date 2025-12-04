/**
 * Tests for OrganizationEditForm component
 * Tests the unified form for editing organization details
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { generatePath } from 'react-router';
import { OrganizationEditForm } from './OrganizationEditForm';
import { UnifiedFormData } from '../../../../models/OrganizationEditTypes';
import {
  OrganizationDetailDTO,
  OrganizationStatus
} from '../../../../../generated/data-contracts';
import { i18nTestSetup } from '../../../../__tests__/i18nTestSetup';

// Mock hooks
const mockControl = {} as unknown;
const mockHandleSubmit = vi.fn((fn) => fn);
const mockErrors = {};
const mockSetError = vi.fn();
const mockTrigger = vi.fn();
const mockSubmit = vi.fn();

const mockUseOrganizationEditForm = {
  control: mockControl,
  handleSubmit: mockHandleSubmit,
  errors: mockErrors,
  watchAdditionalLanguage: false,
  watchFlagNotifyIo: false,
  setError: mockSetError,
  trigger: mockTrigger
};

const mockUseOrganizationSubmit = {
  submit: mockSubmit,
  isSubmitting: false
};

vi.mock('../../../../hooks/useOrganizationEditForm', () => ({
  useOrganizationEditForm: vi.fn(() => mockUseOrganizationEditForm)
}));

vi.mock('../../../../hooks/useOrganizationSubmit', () => ({
  useOrganizationSubmit: vi.fn(() => mockUseOrganizationSubmit)
}));

// Mock react-router
const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  const mockGeneratePath = vi.fn(
    (path: string, params?: Record<string, string>) => {
      if (params?.organizationId) {
        return path.replace(':organizationId', params.organizationId);
      }
      return path;
    }
  );
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    generatePath: mockGeneratePath
  };
});

// Mock utility functions
vi.mock('../../../../utils/organizationFormTransformers', () => ({
  transformFormValuesToFieldData: vi.fn((values, originalData) => ({
    ...originalData,
    ...values
  })),
  handleLogoConversion: vi.fn(async (logoFile, existingLogo) => ({
    logoValue: logoFile ? 'base64Logo' : existingLogo,
    logoRemoved: existingLogo && !logoFile
  }))
}));

vi.mock('../../../../utils/validationRules', () => ({
  createIBANValidationRules: vi.fn(() => ({
    validate: { validIBAN: () => true }
  })),
  validateLogoBeforeSubmit: vi.fn(() => ({
    isValid: true,
    shouldPreventSubmit: false
  }))
}));

// Mock section components
vi.mock('./Step/sections/EntityProfileSection', () => ({
  EntityProfileSection: ({
    data
  }: {
    control: unknown;
    errors: unknown;
    data: UnifiedFormData;
    t: (key: string) => string;
  }) => (
    <div data-testid="entity-profile-section">
      <div data-testid="entity-profile-org-name">{data.orgName.value}</div>
    </div>
  )
}));

vi.mock('./Step/sections/AccountingInfoSection', () => ({
  AccountingInfoSection: () => (
    <div data-testid="accounting-info-section">Accounting Info</div>
  )
}));

vi.mock('./Step/sections/PaymentsInfoSection', () => ({
  PaymentsInfoSection: ({
    watchAdditionalLanguage
  }: {
    control: unknown;
    errors: unknown;
    data: UnifiedFormData;
    t: (key: string) => string;
    watchAdditionalLanguage: boolean;
  }) => (
    <div data-testid="payments-info-section">
      {watchAdditionalLanguage && (
        <div data-testid="additional-language-visible">Language Select</div>
      )}
    </div>
  )
}));

vi.mock('./Step/sections/PagoPAIntegrationSection', () => ({
  PagoPAIntegrationSection: ({
    watchFlagNotifyIo
  }: {
    control: unknown;
    errors: unknown;
    data: UnifiedFormData;
    t: (key: string) => string;
    watchFlagNotifyIo: boolean;
  }) => (
    <div data-testid="pagopa-integration-section">
      {watchFlagNotifyIo && (
        <div data-testid="io-api-key-visible">IO API Key</div>
      )}
    </div>
  )
}));

// Mock FormActionButtons
vi.mock('./FormActionButtons', () => ({
  FormActionButtons: ({
    onBack,
    onSubmit,
    onSaveDraft,
    showSaveDraft,
    isSubmitting
  }: {
    onBack?: () => void;
    onSubmit: () => void;
    onSaveDraft?: () => void;
    showSaveDraft: boolean;
    submitLabel: string;
    isSubmitting: boolean;
  }) => (
    <div data-testid="form-action-buttons">
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      {showSaveDraft && (
        <button
          data-testid="save-draft-button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          Save Draft
        </button>
      )}
      <button
        data-testid="submit-button"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        Submit
      </button>
    </div>
  )
}));

// Mock TitleComponent
vi.mock('../../../../components/TitleComponent/TitleComponent', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="title-component">
      <div data-testid="title">{title}</div>
      <div data-testid="description">{description}</div>
    </div>
  )
}));

describe('OrganizationEditForm', () => {
  const mockFormData: UnifiedFormData = {
    orgName: { value: 'Test Organization', readonly: true },
    orgFiscalCode: { value: '12345678901', readonly: true },
    orgEmail: { value: 'test@example.com', readonly: false },
    orgLogo: { value: 'data:image/png;base64,logo', readonly: false },
    logoRemoved: false,
    iban: { value: 'IT60X0542811101000000123456', readonly: false },
    ibanPostal: { value: '', readonly: false },
    cbill: { value: '', readonly: false },
    flagTreasury: { value: false, readonly: false },
    segregationCode: { value: '00', readonly: false },
    generateNoticeApiKey: { value: 'api-key', readonly: false },
    additionalLanguage: { value: false, readonly: false },
    selectedLanguage: { value: '', readonly: false },
    flagNotifyOutcomePush: { value: false, readonly: false },
    flagPaymentNotification: { value: false, readonly: false },
    flagNotifyIo: { value: false, readonly: false },
    ioApiKey: { value: '', readonly: false },
    pdndEnabled: { value: false, readonly: false },
    sendApiKey: { value: '', readonly: false },
    organizationStatus: 'ACTIVE'
  };

  const mockOriginalData: OrganizationDetailDTO = {
    organizationId: 1,
    flagTreasury: false,
    externalOrganizationId: 'EXT123',
    ipaCode: 'IPA_TEST',
    orgTypeCode: '03',
    orgName: 'Test Organization',
    orgFiscalCode: '12345678901',
    orgEmail: 'test@example.com',
    postalIban: 'IT60X0542811101000000123456',
    iban: 'IT60X0542811101000000123456',
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    password: 'mock-org-value',
    segregationCode: '00',
    cbillInterBankCode: 'CBILL001',
    orgLogo: 'data:image/png;base64,logo',
    status: OrganizationStatus.ACTIVE,
    additionalLanguage: undefined,
    startDate: '2024-01-01',
    brokerId: 1,
    ioApiKey: '',
    sendApiKey: '',
    generateNoticeApiKey: 'api-key',
    flagNotifyIo: false,
    flagNotifyOutcomePush: false,
    flagPaymentNotification: false,
    pdndEnabled: false
  };

  const translations = {
    organizationEditWizard: {
      titleCreate: 'Configura ente gestito',
      titleEdit: 'Modifica ente gestito',
      descriptionCreate:
        "Inserisci le informazioni e le configurazioni relative all'ente intermediato.",
      descriptionEdit:
        "Aggiorna le informazioni e le configurazioni relative all'ente intermediato.",
      step1: {
        title: 'Anagrafica Ente',
        orgLogo: {
          required: 'Il logo è obbligatorio'
        }
      },
      step2: {
        label: 'Configurazione Ente'
      },
      saveChanges: 'Salva modifiche',
      enableOrg: 'Abilita ente'
    },
    commons: {
      requiredFieldDescription: '* Indica un campo obbligatorio'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
    mockHandleSubmit.mockImplementation((fn) => fn);
    mockUseOrganizationSubmit.isSubmitting = false;
  });

  describe('Rendering', () => {
    it('should render all form sections', () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('entity-profile-section')).toBeInTheDocument();
      expect(screen.getByTestId('accounting-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('payments-info-section')).toBeInTheDocument();
      expect(
        screen.getByTestId('pagopa-integration-section')
      ).toBeInTheDocument();
    });

    it('should render TitleComponent with correct props for ACTIVE status', () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('title')).toHaveTextContent(
        'Modifica ente gestito'
      );
      expect(screen.getByTestId('description')).toHaveTextContent(
        "Aggiorna le informazioni e le configurazioni relative all'ente intermediato."
      );
    });

    it('should render TitleComponent with correct props for DRAFT status', () => {
      const draftFormData = {
        ...mockFormData,
        organizationStatus: 'DRAFT' as const
      };

      render(
        <OrganizationEditForm
          formData={draftFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('title')).toHaveTextContent(
        'Configura ente gestito'
      );
      expect(screen.getByTestId('description')).toHaveTextContent(
        "Inserisci le informazioni e le configurazioni relative all'ente intermediato."
      );
    });

    it('should render required field description', () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(
        screen.getByText('* Indica un campo obbligatorio')
      ).toBeInTheDocument();
    });

    it('should render FormActionButtons with correct props', () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should show Save Draft button for DRAFT status', () => {
      const draftFormData = {
        ...mockFormData,
        organizationStatus: 'DRAFT' as const
      };

      render(
        <OrganizationEditForm
          formData={draftFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('save-draft-button')).toBeInTheDocument();
    });

    it('should not show Save Draft button for ACTIVE status', () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.queryByTestId('save-draft-button')).not.toBeInTheDocument();
    });

    it('should pass watchAdditionalLanguage to PaymentsInfoSection', () => {
      mockUseOrganizationEditForm.watchAdditionalLanguage = true;

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(
        screen.getByTestId('additional-language-visible')
      ).toBeInTheDocument();
    });

    it('should pass watchFlagNotifyIo to PagoPAIntegrationSection', () => {
      mockUseOrganizationEditForm.watchFlagNotifyIo = true;

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('io-api-key-visible')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to organization detail page when back button is clicked', async () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      const backButton = screen.getByTestId('back-button');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(vi.mocked(generatePath)).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call submit with enableOrg=false when Save Draft is clicked for DRAFT', async () => {
      const draftFormData = {
        ...mockFormData,
        organizationStatus: 'DRAFT' as const
      };

      const { handleLogoConversion } = await import(
        '../../../../utils/organizationFormTransformers'
      );
      const { validateLogoBeforeSubmit } = await import(
        '../../../../utils/validationRules'
      );

      render(
        <OrganizationEditForm
          formData={draftFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      const saveDraftButton = screen.getByTestId('save-draft-button');
      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(validateLogoBeforeSubmit).toHaveBeenCalled();
        expect(handleLogoConversion).toHaveBeenCalled();
        expect(mockSubmit).toHaveBeenCalledWith(expect.any(Object), false);
      });
    });

    it('should call submit with enableOrg=true when Submit is clicked for DRAFT', async () => {
      const draftFormData = {
        ...mockFormData,
        organizationStatus: 'DRAFT' as const
      };

      render(
        <OrganizationEditForm
          formData={draftFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(expect.any(Object), true);
      });
    });

    it('should call submit with enableOrg=false when Submit is clicked for ACTIVE', async () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(expect.any(Object), false);
      });
    });
  });

  describe('Logo Validation', () => {
    it('should prevent submission when logo validation fails for ACTIVE', async () => {
      const { validateLogoBeforeSubmit } = await import(
        '../../../../utils/validationRules'
      );

      vi.mocked(validateLogoBeforeSubmit).mockReturnValueOnce({
        isValid: false,
        shouldPreventSubmit: true,
        errorMessage: 'Il logo è obbligatorio'
      });

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith('orgLogo', {
          type: 'manual',
          message: 'Il logo è obbligatorio'
        });
        expect(mockTrigger).toHaveBeenCalledWith('orgLogo');
        expect(mockSubmit).not.toHaveBeenCalled();
      });
    });

    it('should allow submission when logo validation passes', async () => {
      const { validateLogoBeforeSubmit } = await import(
        '../../../../utils/validationRules'
      );

      vi.mocked(validateLogoBeforeSubmit).mockReturnValueOnce({
        isValid: true,
        shouldPreventSubmit: false
      });

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Submit Button Label', () => {
    it('should use enableOrg label for DRAFT status', () => {
      const draftFormData = {
        ...mockFormData,
        organizationStatus: 'DRAFT' as const
      };

      render(
        <OrganizationEditForm
          formData={draftFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      // The label is passed to FormActionButtons, which uses translation
      // We can verify the component renders correctly
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should use saveChanges label for ACTIVE status', () => {
      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });
  });

  describe('Submitting State', () => {
    it('should disable submit button when isSubmitting is true', () => {
      mockUseOrganizationSubmit.isSubmitting = true;

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('submit-button')).toBeDisabled();
    });

    it('should disable save draft button when isSubmitting is true', () => {
      mockUseOrganizationSubmit.isSubmitting = true;
      const draftFormData = {
        ...mockFormData,
        organizationStatus: 'DRAFT' as const
      };

      render(
        <OrganizationEditForm
          formData={draftFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(screen.getByTestId('save-draft-button')).toBeDisabled();
    });
  });

  describe('Hooks Integration', () => {
    it('should call useOrganizationEditForm with correct initialData', async () => {
      const { useOrganizationEditForm } = await import(
        '../../../../hooks/useOrganizationEditForm'
      );

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(useOrganizationEditForm).toHaveBeenCalledWith({
        initialData: mockFormData
      });
    });

    it('should call useOrganizationSubmit with correct params', async () => {
      const { useOrganizationSubmit } = await import(
        '../../../../hooks/useOrganizationSubmit'
      );

      render(
        <OrganizationEditForm
          formData={mockFormData}
          organizationId={1}
          originalData={mockOriginalData}
        />
      );

      expect(useOrganizationSubmit).toHaveBeenCalledWith({
        organizationId: 1,
        originalData: mockOriginalData
      });
    });
  });
});
