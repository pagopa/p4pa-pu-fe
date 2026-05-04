import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { useConditionalReset } from '../hooks/useConditionalReset';
import { OrgSilServiceForm } from './OrgSilServiceForm';

vi.mock('../hooks/useConditionalReset');

vi.mock('../components/LegacyAuthConfiguration', () => ({
  LegacyAuthConfiguration: () => <div data-testid="legacy-auth-configuration" />
}));

const translations = {
  'orgSilServiceCreate.subTitle': 'Service Configuration',
  'orgSilServiceCreate.generalConfiguration': 'General Configuration',
  'orgSilServiceCreate.authMethod': 'Authentication Method',
  'orgSilServiceCreate.APIName': 'API Name',
  'orgSilServiceCreate.serviceURL': 'Service URL',
  'orgSilServiceCreate.serviceType': 'Service Type',
  'orgSilServiceCreate.flagLegacy': 'Legacy Authentication',
  'commons.requiredFieldDescription': '* Required fields',
  'commons.back': 'Back',
  'serviceType.PAID_NOTIFICATION_OUTCOME': 'Payment Notification Outcome',
  'serviceType.ACTUALIZATION': 'Actualization',
  'commons.yes': 'Yes',
  'commons.no': 'No'
};

describe('OrgSilServiceForm Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultConfig = {
    title: 'Test Form Title',
    description: 'Test form description',
    submitButtonLabel: 'Submit',
    serviceTypeDisabled: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    i18nTestSetup(translations);

    vi.mocked(useConditionalReset).mockReturnValue({
      watchFlagLegacy: false,
      watchAuthConfigType: undefined
    });
  });

  describe('Rendering', () => {
    it('should render all form elements correctly', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Test Form Title')).toBeInTheDocument();
      expect(screen.getByText('Test form description')).toBeInTheDocument();
      expect(screen.getByText('Service Configuration')).toBeInTheDocument();
      expect(screen.getByText('* Required fields')).toBeInTheDocument();

      expect(
        screen.getByRole('textbox', { name: /API Name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /Service URL/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Service Type/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radiogroup', { name: /Legacy Authentication/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /Submit/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('should render with initial data when provided', () => {
      const initialData = {
        applicationName: 'Initial API',
        serviceUrl: 'https://initial.com',
        flagLegacy: true
      };

      render(
        <OrgSilServiceForm
          config={defaultConfig}
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Initial API')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://initial.com')
      ).toBeInTheDocument();
    });

    it('should disable service type field when configured to do so', () => {
      const configWithDisabledServiceType = {
        ...defaultConfig,
        serviceTypeDisabled: true
      };

      render(
        <OrgSilServiceForm
          config={configWithDisabledServiceType}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const serviceTypeSelect = screen.getByRole('combobox', {
        name: /Service Type/i
      });

      expect(serviceTypeSelect).toBeDisabled();
    });

    it('should enable service type field by default', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const serviceTypeSelect = screen.getByRole('combobox', {
        name: /Service Type/i
      });
      expect(serviceTypeSelect).not.toBeDisabled();
    });
  });

  describe('Form Interaction', () => {
    it('should allow user to fill form fields', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const apiInput = screen.getByRole('textbox', { name: /API Name/i });
      const urlInput = screen.getByRole('textbox', { name: /Service URL/i });

      await user.type(apiInput, 'New API Service');
      await user.type(urlInput, 'https://new-api.com');

      expect(screen.getByDisplayValue('New API Service')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://new-api.com')
      ).toBeInTheDocument();
    });

    it('should handle radio button selection for legacy authentication', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const yesRadio = screen.getByRole('radio', { name: /Yes/i });
      const noRadio = screen.getByRole('radio', { name: /No/i });

      expect(noRadio).toBeChecked();

      await user.click(yesRadio);
      expect(yesRadio).toBeChecked();
      expect(noRadio).not.toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is filled manually by user', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(
        screen.getByRole('textbox', { name: /API Name/i }),
        'Manual Test API'
      );
      await user.type(
        screen.getByRole('textbox', { name: /Service URL/i }),
        'https://manual-test.com'
      );

      const serviceTypeSelect = screen.getByRole('combobox', {
        name: /Service Type/i
      });
      await user.click(serviceTypeSelect);

      await waitFor(async () => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });

      const firstOption = screen.getAllByRole('option')[0];
      await user.click(firstOption);

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Navigation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Back/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    it('should NOT render LegacyAuthConfiguration when flagLegacy is false', () => {
      vi.mocked(useConditionalReset).mockReturnValue({
        watchFlagLegacy: false,
        watchAuthConfigType: undefined
      });

      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.queryByTestId('legacy-auth-configuration')
      ).not.toBeInTheDocument();
    });

    it('should render LegacyAuthConfiguration when flagLegacy is true', () => {
      vi.mocked(useConditionalReset).mockReturnValue({
        watchFlagLegacy: true,
        watchAuthConfigType: 'basic'
      });

      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByTestId('legacy-auth-configuration')
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const apiNameInput = screen.getByRole('textbox', { name: /API Name/i });
        const urlInput = screen.getByRole('textbox', { name: /Service URL/i });

        expect(apiNameInput).toHaveAttribute('aria-invalid', 'true');
        expect(urlInput).toHaveAttribute('aria-invalid', 'true');
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate URL format', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(
        screen.getByRole('textbox', { name: /API Name/i }),
        'Test API'
      );
      await user.type(
        screen.getByRole('textbox', { name: /Service URL/i }),
        'invalid-url'
      );

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const urlInput = screen.getByRole('textbox', { name: /Service URL/i });
        expect(urlInput).toHaveAttribute('aria-invalid', 'true');
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('useConditionalReset Integration', () => {
    it('should call useConditionalReset with watch and resetField functions', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(useConditionalReset).toHaveBeenCalledWith({
        watch: expect.any(Function),
        resetField: expect.any(Function)
      });
    });

    it('should react to changes in watchFlagLegacy', () => {
      const { rerender } = render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.queryByTestId('legacy-auth-configuration')
      ).not.toBeInTheDocument();

      vi.mocked(useConditionalReset).mockReturnValue({
        watchFlagLegacy: true,
        watchAuthConfigType: 'basic'
      });

      rerender(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByTestId('legacy-auth-configuration')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('noValidate');
    });

    it('should have proper labels and required attributes', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const apiNameInput = screen.getByRole('textbox', { name: /API Name/i });
      const urlInput = screen.getByRole('textbox', { name: /Service URL/i });
      const serviceTypeSelect = screen.getByRole('combobox', {
        name: /Service Type/i
      });

      expect(apiNameInput).toHaveAttribute('required');
      expect(urlInput).toHaveAttribute('required');
      expect(serviceTypeSelect).toBeInTheDocument();
    });

    it('should have proper button labels and test ids', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      const cancelButton = screen.getByRole('button', { name: /Back/i });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('data-testid', 'back-button');
    });
  });

  describe('Props Validation', () => {
    it('should handle missing initialData gracefully', () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const apiNameInput = screen.getByRole('textbox', {
        name: /API Name/i
      }) as HTMLInputElement;
      const urlInput = screen.getByRole('textbox', {
        name: /Service URL/i
      }) as HTMLInputElement;

      expect(apiNameInput.value).toBe('');
      expect(urlInput.value).toBe('');
    });

    it('should merge initialData with default values correctly', () => {
      const initialData = {
        applicationName: 'Partial Data'
      };

      render(
        <OrgSilServiceForm
          config={defaultConfig}
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const apiNameInput = screen.getByRole('textbox', {
        name: /API Name/i
      }) as HTMLInputElement;
      const urlInput = screen.getByRole('textbox', {
        name: /Service URL/i
      }) as HTMLInputElement;

      expect(apiNameInput.value).toBe('Partial Data');
      expect(urlInput.value).toBe('');
    });
  });

  describe('Form State Management', () => {
    it('should handle form reset correctly', async () => {
      render(
        <OrgSilServiceForm
          config={defaultConfig}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const apiNameInput = screen.getByRole('textbox', { name: /API Name/i });
      await user.type(apiNameInput, 'Test Input');

      expect(screen.getByDisplayValue('Test Input')).toBeInTheDocument();

      expect(useConditionalReset).toHaveBeenCalled();
    });
  });
});
