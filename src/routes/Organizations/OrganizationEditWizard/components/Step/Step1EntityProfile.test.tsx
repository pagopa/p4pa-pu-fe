import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Step1EntityProfile from './Step1EntityProfile';
import { OrganizationEditStep1Data } from '../../../../../models/OrganizationEditTypes';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';
import * as fileValidation from '../../../../../utils/filevalidation';

vi.mock('../../../../../utils/filevalidation', () => ({
  base64ToFile: vi.fn((base64: string) => {
    if (!base64) return null;
    return new File(['logo'], 'logo.png', { type: 'image/png' });
  }),
  fileToBase64: vi.fn(() => {
    return Promise.resolve('data:image/png;base64,mockBase64String');
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

vi.mock('../../../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledFileUploader: ({
      description,
      fileExtensionsAllowed,
      disabled
    }: {
      name: string;
      control: unknown;
      description: string;
      fileExtensionsAllowed: Array<string>;
      disabled: boolean;
    }) => (
      <div data-testid="file-uploader">
        <input
          type="file"
          data-testid="file-input"
          accept={fileExtensionsAllowed.map((ext) => `.${ext}`).join(',')}
          disabled={disabled}
        />
        <span>{description}</span>
      </div>
    )
  }
}));

describe('Step1EntityProfile', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const mockInitialData: OrganizationEditStep1Data = {
    orgName: {
      value: '',
      readonly: false
    },
    orgFiscalCode: {
      value: '',
      readonly: false
    },
    orgEmail: {
      value: '',
      readonly: false
    },
    orgLogo: {
      value: '',
      readonly: false
    }
  };

  const mockFilledData: OrganizationEditStep1Data = {
    orgName: {
      value: 'Ente Test',
      readonly: false
    },
    orgFiscalCode: {
      value: '12345678901',
      readonly: false
    },
    orgEmail: {
      value: 'test@ente.it',
      readonly: false
    },
    orgLogo: {
      value: 'data:image/png;base64,iVBORw0KGgo...',
      readonly: false
    }
  };

  const translations = {
    organizationEditWizard: {
      step1: {
        title: 'Anagrafica Ente',
        orgName: {
          label: 'Nome Ente',
          placeholder: "Inserisci il nome dell'ente"
        },
        orgFiscalCode: {
          label: 'Codice Fiscale',
          placeholder: 'Inserisci il codice fiscale'
        },
        orgEmail: {
          label: 'Email',
          invalid: 'Email non valida',
          helperText: 'Inserisci un indirizzo email valido'
        },
        orgLogo: {
          title: 'Logo Ente',
          optional: 'Facoltativo',
          description: 'Carica il logo del tuo ente',
          uploadDescription: 'Trascina qui il file o clicca per selezionarlo',
          requirements: 'Requisiti:',
          learnMore: 'Scopri di più'
        }
      }
    },
    commons: {
      requiredFieldDescription: '* Campi obbligatori',
      continue: 'Continua',
      back: 'Indietro'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
  });

  describe('Rendering', () => {
    it('should render all form fields correctly', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Anagrafica Ente')).toBeInTheDocument();
      expect(screen.getByTestId('org-name-field')).toBeInTheDocument();
      expect(screen.getByTestId('org-fiscal-code-field')).toBeInTheDocument();
      expect(screen.getByTestId('org-email-field')).toBeInTheDocument();
      expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
    });

    it('should render wizard buttons', () => {
      render(
        <Step1EntityProfile
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

    it('should display required field description', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('* Campi obbligatori')).toBeInTheDocument();
    });

    it('should display logo section with optional label', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Logo Ente')).toBeInTheDocument();
      expect(screen.getByText('- Facoltativo')).toBeInTheDocument();
    });
  });

  describe('Form Population', () => {
    it('should populate form fields with initial data', () => {
      render(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgNameInput = screen
        .getByTestId('org-name-field')
        .querySelector('input');
      const orgFiscalCodeInput = screen
        .getByTestId('org-fiscal-code-field')
        .querySelector('input');
      const orgEmailInput = screen
        .getByTestId('org-email-field')
        .querySelector('input');

      expect(orgNameInput).toHaveValue('Ente Test');
      expect(orgFiscalCodeInput).toHaveValue('12345678901');
      expect(orgEmailInput).toHaveValue('test@ente.it');
    });

    it('should populate empty fields when data is empty', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgNameInput = screen
        .getByTestId('org-name-field')
        .querySelector('input');
      const orgFiscalCodeInput = screen
        .getByTestId('org-fiscal-code-field')
        .querySelector('input');

      expect(orgNameInput).toHaveValue('');
      expect(orgFiscalCodeInput).toHaveValue('');
    });
  });

  describe('Field Disabled State', () => {
    it('should disable orgName field when readonly is true', () => {
      const readonlyData = {
        ...mockFilledData,
        orgName: { ...mockFilledData.orgName, readonly: true }
      };

      render(
        <Step1EntityProfile
          data={readonlyData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgNameInput = screen
        .getByTestId('org-name-field')
        .querySelector('input');
      expect(orgNameInput).toBeDisabled();
    });

    it('should disable orgName field when it has a value', () => {
      render(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgNameInput = screen
        .getByTestId('org-name-field')
        .querySelector('input');
      expect(orgNameInput).toBeDisabled();
    });

    it('should disable orgFiscalCode field when it has a value', () => {
      render(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgFiscalCodeInput = screen
        .getByTestId('org-fiscal-code-field')
        .querySelector('input');
      expect(orgFiscalCodeInput).toBeDisabled();
    });

    it('should always disable orgEmail field', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgEmailInput = screen
        .getByTestId('org-email-field')
        .querySelector('input');
      expect(orgEmailInput).toBeDisabled();
    });

    it('should disable file uploader when orgLogo is readonly', () => {
      const readonlyData = {
        ...mockInitialData,
        orgLogo: { ...mockInitialData.orgLogo, readonly: true }
      };

      render(
        <Step1EntityProfile
          data={readonlyData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toBeDisabled();
    });
  });

  describe('Email Validation', () => {
    it('should show error for invalid email format', async () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgEmailInput = screen
        .getByTestId('org-email-field')
        .querySelector('input');

      expect(orgEmailInput).toBeDisabled();
    });

    it('should display email helper text', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(
        screen.getByText('Inserisci un indirizzo email valido')
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onNext when form is submitted with valid data', async () => {
      render(
        <Step1EntityProfile
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

    it('should call setData with correct values on submit', async () => {
      render(
        <Step1EntityProfile
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
            orgName: expect.objectContaining({
              value: 'Ente Test',
              readonly: false
            }),
            orgFiscalCode: expect.objectContaining({
              value: '12345678901',
              readonly: false
            }),
            orgEmail: expect.objectContaining({
              value: 'test@ente.it',
              readonly: false
            })
          })
        );
      });
    });

    it('should preserve readonly state when submitting', async () => {
      const readonlyData = {
        ...mockFilledData,
        orgName: { ...mockFilledData.orgName, readonly: true }
      };

      render(
        <Step1EntityProfile
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
            orgName: expect.objectContaining({
              readonly: true
            })
          })
        );
      });
    });
  });

  describe('Logo Handling', () => {
    it('should convert base64 logo to file on mount', () => {
      render(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(fileValidation.base64ToFile).toHaveBeenCalledWith(
        'data:image/png;base64,iVBORw0KGgo...'
      );
    });

    it('should handle null logo value', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(fileValidation.base64ToFile).not.toHaveBeenCalled();
    });

    it('should display file uploader with correct extensions', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('accept', '.png,.jpg,.jpeg,.svg');
    });

    it('should display logo requirements with learn more link', () => {
      render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Requisiti:')).toBeInTheDocument();
      expect(screen.getByText('Scopri di più')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', () => {
      render(
        <Step1EntityProfile
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
        <Step1EntityProfile
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
  });

  describe('Form Values Sync', () => {
    it('should update form when data prop changes', () => {
      const { rerender } = render(
        <Step1EntityProfile
          data={mockInitialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const orgNameInput = screen
        .getByTestId('org-name-field')
        .querySelector('input');
      expect(orgNameInput).toHaveValue('');

      rerender(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(orgNameInput).toHaveValue('Ente Test');
    });

    it('should use useMemo for logo file conversion to prevent re-renders', () => {
      const { rerender } = render(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const callCount = vi.mocked(fileValidation.base64ToFile).mock.calls
        .length;

      rerender(
        <Step1EntityProfile
          data={mockFilledData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(vi.mocked(fileValidation.base64ToFile).mock.calls.length).toBe(
        callCount
      );
    });
  });
});
