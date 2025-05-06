import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import DebtPositionCreateWizardCompleted from './DebtPositionCreateWizardCompleted';
import config from '../../utils/config';

// Module mocks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn()
  };
});

// react-i18next mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      // Simple implementation for translations used in tests
      if (key === 'debtPositionCreateWizardCompleted.title') {
        return `The debt position '${options?.paymentObject || ''}' has been created!`;
      }
      if (key === 'debtPositionCreateWizardCompleted.description') {
        return 'You can find it in the Debts section, where you can track its progress.';
      }
      if (key === 'debtPositionCreateWizardCompleted.backToStart') {
        return 'Back to start';
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

    // Set environment variable for tests
    vi.stubEnv('VITE_DEPLOY_PATH', '/test-path');

    // Directly update the config.deployPath value
    config.deployPath = '/test-path';
  });

  afterEach(() => {
    // Restore original environment variables after each test
    vi.unstubAllEnvs();

    // Restore original config.deployPath value
    config.deployPath = originalDeployPath;
  });

  it('correctly renders the component with title and description', () => {
    // Configure useLocation mock to provide a description
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment' }
    });

    render(
      <MemoryRouter>
        <DebtPositionCreateWizardCompleted />
      </MemoryRouter>
    );

    // Verify that title contains the description
    expect(
      screen.getByText(/The debt position 'Test Payment' has been created!/i)
    ).toBeInTheDocument();

    // Verify that description is present
    expect(
      screen.getByText(
        /You can find it in the Debts section, where you can track its progress./i
      )
    ).toBeInTheDocument();

    // Verify that "Back to start" button is present
    expect(
      screen.getByRole('button', { name: /Back to start/i })
    ).toBeInTheDocument();
  });

  it('correctly handles the case when description is not provided', () => {
    // Configure useLocation mock without description
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {}
    });

    render(
      <MemoryRouter>
        <DebtPositionCreateWizardCompleted />
      </MemoryRouter>
    );

    // Verify that title contains an empty value for description
    expect(
      screen.getByText(/The debt position '' has been created!/i)
    ).toBeInTheDocument();
  });

  it('navigates correctly when clicking the "Back to start" button', () => {
    // Configure useLocation mock
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment' }
    });

    render(
      <MemoryRouter>
        <DebtPositionCreateWizardCompleted />
      </MemoryRouter>
    );

    // Find and click the button
    const backButton = screen.getByRole('button', {
      name: /Back to start/i
    });
    fireEvent.click(backButton);

    // Verify that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/test-path/debt-positions/');
  });
});
