import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import DebtPositionCreateWizardCompleted from './DebtPositionCreateWizardCompleted';
import config from '../../utils/config';

// Mock dei moduli
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn()
  };
});

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      // Implementazione semplice per le traduzioni utilizzate nei test
      if (key === 'debtPositionCreateWizardCompleted.title') {
        return `La posizione debitoria '${options?.paymentObject || ''}' è stata creata!`;
      }
      if (key === 'debtPositionCreateWizardCompleted.description') {
        return "La trovi nella sezione Dovuti, dove puoi tenere traccia dell'andamento.";
      }
      if (key === 'debtPositionCreateWizardCompleted.backToStart') {
        return "Torna all'inizio";
      }
      return key;
    }
  })
}));

describe('DebtPositionCreateWizardCompleted', () => {
  const mockNavigate = vi.fn();
  const originalDeployPath = config.deployPath;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );

    // Imposta la variabile d'ambiente per i test
    vi.stubEnv('VITE_DEPLOY_PATH', '/test-path');

    // Aggiorna direttamente il valore di config.deployPath
    config.deployPath = '/test-path';
  });

  afterEach(() => {
    // Ripristina le variabili d'ambiente originali dopo ogni test
    vi.unstubAllEnvs();

    // Ripristina il valore originale di config.deployPath
    config.deployPath = originalDeployPath;
  });

  it('renderizza correttamente il componente con il titolo e la descrizione', () => {
    // Configura il mock di useLocation per fornire un paymentObject
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { paymentObject: 'Test Payment' }
    });

    render(
      <MemoryRouter>
        <DebtPositionCreateWizardCompleted />
      </MemoryRouter>
    );

    // Verifica che il titolo contenga il paymentObject
    expect(
      screen.getByText(/La posizione debitoria 'Test Payment' è stata creata!/i)
    ).toBeInTheDocument();

    // Verifica che la descrizione sia presente
    expect(
      screen.getByText(
        /La trovi nella sezione Dovuti, dove puoi tenere traccia dell'andamento./i
      )
    ).toBeInTheDocument();

    // Verifica che il pulsante "Torna all'inizio" sia presente
    expect(
      screen.getByRole('button', { name: /Torna all'inizio/i })
    ).toBeInTheDocument();
  });

  it('gestisce correttamente il caso in cui paymentObject non è fornito', () => {
    // Configura il mock di useLocation senza paymentObject
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {}
    });

    render(
      <MemoryRouter>
        <DebtPositionCreateWizardCompleted />
      </MemoryRouter>
    );

    // Verifica che il titolo contenga un valore vuoto per paymentObject
    expect(
      screen.getByText(/La posizione debitoria '' è stata creata!/i)
    ).toBeInTheDocument();
  });

  it('naviga correttamente quando si clicca sul pulsante "Torna all\'inizio"', () => {
    // Configura il mock di useLocation
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { paymentObject: 'Test Payment' }
    });

    render(
      <MemoryRouter>
        <DebtPositionCreateWizardCompleted />
      </MemoryRouter>
    );

    // Trova e clicca sul pulsante
    const backButton = screen.getByRole('button', {
      name: /Torna all'inizio/i
    });
    fireEvent.click(backButton);

    // Verifica che navigate sia stato chiamato con il percorso corretto
    expect(mockNavigate).toHaveBeenCalledWith('/test-path/debt-positions/');
  });
});
