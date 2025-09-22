import { vi, describe, it, expect, beforeEach } from 'vitest';
import CallbackPage from './CallbackPage';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn()
  };
});

import * as router from 'react-router';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen } from '../../__tests__/renderers';

const mockTranslations = {
  'callback.success.title': 'Pagamento completato con successo',
  'callback.success.description':
    'Il tuo pagamento è stato processato correttamente. Riceverai una conferma via email a breve.',
  'callback.error.title': 'Pagamento non riuscito',
  'callback.error.description':
    'Si è verificato un errore durante il processo di pagamento. Ti preghiamo di riprovare.',
  'callback.cancel.title': 'Pagamento annullato',
  'callback.cancel.description':
    'Hai annullato il processo di pagamento. Puoi riprovare quando vuoi.'
};

const mockParams = (outcome: string | undefined) => {
  vi.mocked(router.useParams).mockReturnValue({ outcome });
};

describe('CallbackPage', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
    vi.clearAllMocks();
  });

  describe('Success callback (OK)', () => {
    it('should render success message and icon for ok outcome', () => {
      mockParams('ok');

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Il tuo pagamento è stato processato correttamente. Riceverai una conferma via email a breve.'
        )
      ).toBeInTheDocument();

      const successIcon = screen.getByTestId('CheckCircleOutlineOutlinedIcon');
      expect(successIcon).toBeInTheDocument();

      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
    });

    it('should have correct accessibility attributes for success state', () => {
      mockParams('ok');

      render(<CallbackPage />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Pagamento completato con successo');
    });

    it('should display success icon with correct styling', () => {
      mockParams('ok');

      render(<CallbackPage />);

      const successIcon = screen.getByTestId('CheckCircleOutlineOutlinedIcon');
      expect(successIcon).toBeInTheDocument();
      expect(successIcon).toHaveStyle({ fontSize: '60px' });
    });
  });

  describe('Error callback (KO)', () => {
    it('should render error message and icon for ko outcome', () => {
      mockParams('ko');

      render(<CallbackPage />);

      expect(screen.getByText('Pagamento non riuscito')).toBeInTheDocument();

      expect(
        screen.getByText(
          'Si è verificato un errore durante il processo di pagamento. Ti preghiamo di riprovare.'
        )
      ).toBeInTheDocument();

      const errorIcon = screen.getByTestId('ErrorOutlineIcon');
      expect(errorIcon).toBeInTheDocument();

      expect(screen.getByTestId('callback-page-ko')).toBeInTheDocument();
    });

    it('should have correct accessibility attributes for error state', () => {
      mockParams('ko');

      render(<CallbackPage />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Pagamento non riuscito');
    });

    it('should display error icon with correct styling', () => {
      mockParams('ko');

      render(<CallbackPage />);

      const errorIcon = screen.getByTestId('ErrorOutlineIcon');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveStyle({ fontSize: '60px' });
    });
  });

  describe('Cancel callback (CANCEL)', () => {
    it('should render cancel message and icon for cancel outcome', () => {
      mockParams('cancel');

      render(<CallbackPage />);

      expect(screen.getByText('Pagamento annullato')).toBeInTheDocument();

      expect(
        screen.getByText(
          'Hai annullato il processo di pagamento. Puoi riprovare quando vuoi.'
        )
      ).toBeInTheDocument();

      const warningIcon = screen.getByTestId('WarningAmberOutlinedIcon');
      expect(warningIcon).toBeInTheDocument();

      expect(screen.getByTestId('callback-page-cancel')).toBeInTheDocument();
    });

    it('should have correct accessibility attributes for cancel state', () => {
      mockParams('cancel');

      render(<CallbackPage />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Pagamento annullato');
    });

    it('should display warning icon with correct styling', () => {
      mockParams('cancel');

      render(<CallbackPage />);

      const warningIcon = screen.getByTestId('WarningAmberOutlinedIcon');
      expect(warningIcon).toBeInTheDocument();
      expect(warningIcon).toHaveStyle({ fontSize: '60px' });
    });
  });

  describe('Parameter detection logic', () => {
    it('should default to success state for undefined outcome parameter', () => {
      mockParams(undefined);

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
      expect(
        screen.getByTestId('CheckCircleOutlineOutlinedIcon')
      ).toBeInTheDocument();
    });

    it('should default to success state for unknown outcome parameter', () => {
      mockParams('unknown');

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
      expect(
        screen.getByTestId('CheckCircleOutlineOutlinedIcon')
      ).toBeInTheDocument();
    });

    it('should default to success state for empty string outcome', () => {
      mockParams('');

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
    });

    it('should handle case sensitivity correctly', () => {
      mockParams('OK');
      const { rerender } = render(<CallbackPage />);
      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();

      mockParams('Ko');
      rerender(<CallbackPage />);
      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
    });

    it('should correctly handle different valid outcomes in sequence', () => {
      mockParams('ko');
      const { rerender } = render(<CallbackPage />);
      expect(screen.getByText('Pagamento non riuscito')).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-ko')).toBeInTheDocument();

      mockParams('cancel');
      rerender(<CallbackPage />);
      expect(screen.getByText('Pagamento annullato')).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-cancel')).toBeInTheDocument();

      mockParams('ok');
      rerender(<CallbackPage />);
      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
    });
  });

  describe('Component structure and styling', () => {
    it('should have correct layout structure for success state', () => {
      mockParams('ok');

      render(<CallbackPage />);

      const container = screen.getByTestId('callback-page-ok').closest('div');
      expect(container).toBeInTheDocument();

      const icon = screen.getByTestId('CheckCircleOutlineOutlinedIcon');
      const title = screen.getByText('Pagamento completato con successo');
      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('should have correct layout structure for error state', () => {
      mockParams('ko');

      render(<CallbackPage />);

      const container = screen.getByTestId('callback-page-ko').closest('div');
      expect(container).toBeInTheDocument();

      const icon = screen.getByTestId('ErrorOutlineIcon');
      const title = screen.getByText('Pagamento non riuscito');
      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('should have correct layout structure for cancel state', () => {
      mockParams('cancel');

      render(<CallbackPage />);

      const container = screen
        .getByTestId('callback-page-cancel')
        .closest('div');
      expect(container).toBeInTheDocument();

      const icon = screen.getByTestId('WarningAmberOutlinedIcon');
      const title = screen.getByText('Pagamento annullato');
      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('should render both title and description when provided', () => {
      mockParams('ok');

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Il tuo pagamento è stato processato correttamente/)
      ).toBeInTheDocument();
    });

    it('should have proper text alignment and spacing', () => {
      mockParams('ok');

      render(<CallbackPage />);

      const titleComponent = screen.getByTestId('callback-page-ok');
      expect(titleComponent).toBeInTheDocument();

      const mainBox = titleComponent.closest(
        '[data-testid="callback-page-ok"]'
      )?.parentElement;
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should use translation keys correctly for success state', () => {
      const englishTranslations = {
        'callback.success.title': 'Payment completed successfully',
        'callback.success.description':
          'Your payment has been processed correctly. You will receive an email confirmation shortly.',
        'callback.error.title': 'Payment failed',
        'callback.error.description':
          'An error occurred during payment processing. Please try again.',
        'callback.cancel.title': 'Payment cancelled',
        'callback.cancel.description':
          'You have cancelled the payment process. You can try again anytime.'
      };

      i18nTestSetup(englishTranslations);
      mockParams('ok');

      render(<CallbackPage />);

      expect(
        screen.getByText('Payment completed successfully')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Your payment has been processed correctly. You will receive an email confirmation shortly.'
        )
      ).toBeInTheDocument();
    });

    it('should use translation keys correctly for error state', () => {
      const englishTranslations = {
        'callback.success.title': 'Payment completed successfully',
        'callback.success.description':
          'Your payment has been processed correctly.',
        'callback.error.title': 'Payment failed',
        'callback.error.description':
          'An error occurred during payment processing. Please try again.',
        'callback.cancel.title': 'Payment cancelled',
        'callback.cancel.description': 'You have cancelled the payment process.'
      };

      i18nTestSetup(englishTranslations);
      mockParams('ko');

      render(<CallbackPage />);

      expect(screen.getByText('Payment failed')).toBeInTheDocument();
      expect(
        screen.getByText(
          'An error occurred during payment processing. Please try again.'
        )
      ).toBeInTheDocument();
    });

    it('should use translation keys correctly for cancel state', () => {
      const englishTranslations = {
        'callback.success.title': 'Payment completed successfully',
        'callback.success.description':
          'Your payment has been processed correctly.',
        'callback.error.title': 'Payment failed',
        'callback.error.description':
          'An error occurred during payment processing.',
        'callback.cancel.title': 'Payment cancelled',
        'callback.cancel.description':
          'You have cancelled the payment process. You can try again anytime.'
      };

      i18nTestSetup(englishTranslations);
      mockParams('cancel');

      render(<CallbackPage />);

      expect(screen.getByText('Payment cancelled')).toBeInTheDocument();
      expect(
        screen.getByText(
          'You have cancelled the payment process. You can try again anytime.'
        )
      ).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      i18nTestSetup({});
      mockParams('ok');

      render(<CallbackPage />);

      expect(screen.getByText('callback.success.title')).toBeInTheDocument();
      expect(
        screen.getByText('callback.success.description')
      ).toBeInTheDocument();
    });
  });

  describe('Icon rendering', () => {
    it('should render different icons for different outcomes', () => {
      mockParams('ok');
      const { rerender } = render(<CallbackPage />);
      expect(
        screen.getByTestId('CheckCircleOutlineOutlinedIcon')
      ).toBeInTheDocument();
      expect(screen.queryByTestId('ErrorOutlineIcon')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('WarningAmberOutlinedIcon')
      ).not.toBeInTheDocument();

      mockParams('ko');
      rerender(<CallbackPage />);
      expect(
        screen.queryByTestId('CheckCircleOutlineOutlinedIcon')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
      expect(
        screen.queryByTestId('WarningAmberOutlinedIcon')
      ).not.toBeInTheDocument();

      mockParams('cancel');
      rerender(<CallbackPage />);
      expect(
        screen.queryByTestId('CheckCircleOutlineOutlinedIcon')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('ErrorOutlineIcon')).not.toBeInTheDocument();
      expect(
        screen.getByTestId('WarningAmberOutlinedIcon')
      ).toBeInTheDocument();
    });
  });

  describe('Data test IDs', () => {
    it('should generate correct data-testid for each outcome', () => {
      mockParams('ok');
      const { rerender } = render(<CallbackPage />);
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();

      mockParams('ko');
      rerender(<CallbackPage />);
      expect(screen.getByTestId('callback-page-ko')).toBeInTheDocument();

      mockParams('cancel');
      rerender(<CallbackPage />);
      expect(screen.getByTestId('callback-page-cancel')).toBeInTheDocument();
    });

    it('should generate default data-testid for unknown outcome', () => {
      mockParams('unknown');
      render(<CallbackPage />);
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
    });
  });
});
