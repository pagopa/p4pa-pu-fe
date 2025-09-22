import { vi, describe, it, expect, beforeEach } from 'vitest';
import CallbackPage from './CallbackPage';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: vi.fn()
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

const mockLocationPath = (pathname: string) => {
  vi.mocked(router.useLocation).mockReturnValue({
    pathname,
    search: '',
    hash: '',
    state: null,
    key: 'default'
  });
};

describe('CallbackPage', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
    vi.clearAllMocks();
  });

  describe('Success callback (OK)', () => {
    it('should render success message and icon for /ok path', () => {
      mockLocationPath('/checkout-callback/ok');

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
      mockLocationPath('/checkout-callback/ok');

      render(<CallbackPage />);

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Pagamento completato con successo');
    });
  });

  describe('Error callback (KO)', () => {
    it('should render error message and icon for /ko path', () => {
      mockLocationPath('/checkout-callback/ko');

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
  });

  describe('Cancel callback (CANCEL)', () => {
    it('should render cancel message and icon for /cancel path', () => {
      mockLocationPath('/checkout-callback/cancel');

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
  });

  describe('Path detection logic', () => {
    it('should default to success state for unknown paths', () => {
      mockLocationPath('/unknown-path');

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(screen.getByTestId('callback-page-ok')).toBeInTheDocument();
    });

    it('should correctly detect different callback types in nested paths', () => {
      mockLocationPath('/some/deep/path/checkout-callback/ko/extra');
      render(<CallbackPage />);
      expect(screen.getByText('Pagamento non riuscito')).toBeInTheDocument();

      screen.getByTestId('callback-page-ko').remove();

      mockLocationPath('/checkout-callback/cancel?param=value');
      render(<CallbackPage />);
      expect(screen.getByText('Pagamento annullato')).toBeInTheDocument();
    });
  });

  describe('Component structure and styling', () => {
    it('should have correct layout structure', () => {
      mockLocationPath('/checkout-callback/ok');

      render(<CallbackPage />);

      const container = screen.getByTestId('callback-page-ok').closest('div');
      expect(container).toBeInTheDocument();

      const icon = screen.getByTestId('CheckCircleOutlineOutlinedIcon');
      const title = screen.getByText('Pagamento completato con successo');
      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('should render both title and description when provided', () => {
      mockLocationPath('/checkout-callback/ok');

      render(<CallbackPage />);

      expect(
        screen.getByText('Pagamento completato con successo')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Il tuo pagamento è stato processato correttamente/)
      ).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should use translation keys correctly', () => {
      const englishTranslations = {
        'callback.success.title': 'Payment completed successfully',
        'callback.success.description':
          'Your payment has been processed correctly.',
        'callback.error.title': 'Payment failed',
        'callback.error.description':
          'An error occurred during payment processing.',
        'callback.cancel.title': 'Payment cancelled',
        'callback.cancel.description': 'You have cancelled the payment process.'
      };

      i18nTestSetup(englishTranslations);
      mockLocationPath('/checkout-callback/ok');

      render(<CallbackPage />);

      expect(
        screen.getByText('Payment completed successfully')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Your payment has been processed correctly.')
      ).toBeInTheDocument();
    });
  });
});
