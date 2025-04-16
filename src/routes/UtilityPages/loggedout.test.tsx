import { describe, it, expect, vi } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen } from '../../__tests__/renderers';
import { LoggedOut } from './loggedout';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    )
  };
});

describe('LoggedOut', () => {
  beforeEach(() => {
    i18nTestSetup({
      utilityPages: {
        loggedout: {
          title: 'Sessione terminata',
          subtitle: 'La tua sessione è terminata'
        }
      }
    });
  });

  it('should render logged out page with correct text', () => {
    render(<LoggedOut />);

    expect(screen.getByText('Sessione terminata')).toBeInTheDocument();
    expect(screen.getByText('La tua sessione è terminata')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/login');
  });
});
