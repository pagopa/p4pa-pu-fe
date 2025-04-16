import { describe, it, expect, vi } from 'vitest';
import ErrorPage from './error';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen } from '../../__tests__/renderers';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    )
  };
});

describe('ErrorPage', () => {
  beforeEach(() => {
    i18nTestSetup({
      utilityPages: {
        error: {
          title: 'Errore',
          subtitle: 'Si è verificato un errore'
        }
      }
    });
  });

  it('should render error page with correct text', () => {
    render(<ErrorPage />);

    expect(screen.getByText('Errore')).toBeInTheDocument();
    expect(screen.getByText('Si è verificato un errore')).toBeInTheDocument();
    expect(screen.getByText('Riprova')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
  });
});
