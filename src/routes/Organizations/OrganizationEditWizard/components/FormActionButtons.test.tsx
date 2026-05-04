/**
 * Tests for FormActionButtons component
 * Tests the unified form action buttons: Back, Save Draft (conditional), and Submit
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormActionButtons } from './FormActionButtons';
import { i18nTestSetup } from '../../../../__tests__/i18nTestSetup';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'commons.back': 'Indietro',
        'commons.saveDraft': 'Salva bozza',
        'organizationEditWizard.saveChanges': 'Salva modifiche',
        'organizationEditWizard.enableOrg': 'Abilita ente',
        'custom.back': 'Torna indietro',
        'custom.saveDraft': 'Salva come bozza',
        'custom.submit': 'Invia'
      };
      return translations[key] || key;
    }
  }))
}));

describe('FormActionButtons', () => {
  const mockOnBack = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnSaveDraft = vi.fn();

  const translations = {
    commons: {
      back: 'Indietro',
      saveDraft: 'Salva bozza'
    },
    organizationEditWizard: {
      saveChanges: 'Salva modifiche',
      enableOrg: 'Abilita ente'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);
  });

  describe('Rendering', () => {
    it('should render all buttons with default labels', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('form-back-button')).toBeInTheDocument();
      expect(screen.getByTestId('form-submit-button')).toBeInTheDocument();
      expect(screen.getByText('Indietro')).toBeInTheDocument();
      expect(screen.getByText('Salva modifiche')).toBeInTheDocument();
    });

    it('should not render Save Draft button by default', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(
        screen.queryByTestId('form-save-draft-button')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Salva bozza')).not.toBeInTheDocument();
    });

    it('should render Save Draft button when showSaveDraft is true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
        />
      );

      expect(screen.getByTestId('form-save-draft-button')).toBeInTheDocument();
      expect(screen.getByText('Salva bozza')).toBeInTheDocument();
    });
  });

  describe('Button Labels', () => {
    it('should use custom back label when provided', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          backLabel="custom.back"
        />
      );

      expect(screen.getByText('Torna indietro')).toBeInTheDocument();
    });

    it('should use custom submit label when provided', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          submitLabel="organizationEditWizard.enableOrg"
        />
      );

      expect(screen.getByText('Abilita ente')).toBeInTheDocument();
    });

    it('should use custom save draft label when provided', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
          saveDraftLabel="custom.saveDraft"
        />
      );

      expect(screen.getByText('Salva come bozza')).toBeInTheDocument();
    });
  });

  describe('Button Click Handlers', () => {
    it('should call onBack when back button is clicked', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByTestId('form-back-button');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when submit button is clicked', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const submitButton = screen.getByTestId('form-submit-button');
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onSaveDraft when save draft button is clicked', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
        />
      );

      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      fireEvent.click(saveDraftButton);

      expect(mockOnSaveDraft).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when onBack is not provided and back button is clicked', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} />);

      const backButton = screen.getByTestId('form-back-button');
      expect(() => fireEvent.click(backButton)).not.toThrow();
    });

    it('should not throw error when onSaveDraft is not provided and save draft button is clicked', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          showSaveDraft={true}
        />
      );

      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      expect(() => fireEvent.click(saveDraftButton)).not.toThrow();
    });
  });

  describe('Button Disabled States', () => {
    it('should disable back button when disableBack is true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          disableBack={true}
        />
      );

      const backButton = screen.getByTestId('form-back-button');
      expect(backButton).toBeDisabled();
    });

    it('should disable submit button when disableSubmit is true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          disableSubmit={true}
        />
      );

      const submitButton = screen.getByTestId('form-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should disable save draft button when disableSaveDraft is true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
          disableSaveDraft={true}
        />
      );

      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      expect(saveDraftButton).toBeDisabled();
    });

    it('should disable submit button when isSubmitting is true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByTestId('form-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should disable save draft button when isSubmitting is true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
          isSubmitting={true}
        />
      );

      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      expect(saveDraftButton).toBeDisabled();
    });

    it('should disable submit button when both disableSubmit and isSubmitting are true', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          disableSubmit={true}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByTestId('form-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should not call handler when button is disabled and clicked', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          disableBack={true}
          disableSubmit={true}
        />
      );

      const backButton = screen.getByTestId('form-back-button');
      const submitButton = screen.getByTestId('form-submit-button');

      fireEvent.click(backButton);
      fireEvent.click(submitButton);

      expect(mockOnBack).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Button Variants', () => {
    it('should render back button with outlined variant', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByTestId('form-back-button');
      expect(backButton).toHaveClass('MuiButton-outlined');
    });

    it('should render submit button with contained variant', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const submitButton = screen.getByTestId('form-submit-button');
      expect(submitButton).toHaveClass('MuiButton-contained');
    });

    it('should render save draft button with text variant', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
        />
      );

      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      expect(saveDraftButton).toHaveClass('MuiButton-text');
    });
  });

  describe('Icons', () => {
    it('should render ArrowBack icon in back button', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const backButton = screen.getByTestId('form-back-button');
      // Check if icon is present (MUI icons render as SVG)
      const icon = backButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render Save icon in save draft button', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
        />
      );

      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      // Check if icon is present (MUI icons render as SVG)
      const icon = saveDraftButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render buttons container with correct test id', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
    });

    it('should have back button on the left side', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} onBack={mockOnBack} />);

      const container = screen.getByTestId('form-action-buttons');
      const backButton = screen.getByTestId('form-back-button');
      const submitButton = screen.getByTestId('form-submit-button');

      // Check that back button comes before submit button in DOM order
      expect(container).toContainElement(backButton);
      expect(container).toContainElement(submitButton);
    });

    it('should have submit and save draft buttons on the right side', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
        />
      );

      const container = screen.getByTestId('form-action-buttons');
      const saveDraftButton = screen.getByTestId('form-save-draft-button');
      const submitButton = screen.getByTestId('form-submit-button');

      expect(container).toContainElement(saveDraftButton);
      expect(container).toContainElement(submitButton);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all buttons disabled', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
          disableBack={true}
          disableSubmit={true}
          disableSaveDraft={true}
        />
      );

      expect(screen.getByTestId('form-back-button')).toBeDisabled();
      expect(screen.getByTestId('form-submit-button')).toBeDisabled();
      expect(screen.getByTestId('form-save-draft-button')).toBeDisabled();
    });

    it('should handle isSubmitting with all buttons', () => {
      render(
        <FormActionButtons
          onSubmit={mockOnSubmit}
          onBack={mockOnBack}
          onSaveDraft={mockOnSaveDraft}
          showSaveDraft={true}
          isSubmitting={true}
        />
      );

      expect(screen.getByTestId('form-submit-button')).toBeDisabled();
      expect(screen.getByTestId('form-save-draft-button')).toBeDisabled();
      // Back button should not be disabled by isSubmitting
      expect(screen.getByTestId('form-back-button')).not.toBeDisabled();
    });

    it('should work correctly when only onSubmit is provided', () => {
      render(<FormActionButtons onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('form-submit-button')).toBeInTheDocument();
      expect(screen.getByTestId('form-back-button')).toBeInTheDocument();
    });
  });
});
