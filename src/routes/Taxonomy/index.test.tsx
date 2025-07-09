import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../__tests__/renderers';
import TaxonomyPage from '.';
import { useNavigate } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../utils/filtersValidation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    noFilterSetted: vi.fn()
  };
});

vi.mock('../../api/taxonomy', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    synchronizeTaxonomy: () => ({
      mutateAsync: vi.fn()
    }),
    getOrganizationsTypes: vi.fn(() => Promise.resolve([])),
    getMacroAreas: vi.fn(() => Promise.resolve([])),
    getServiceTypes: vi.fn(() => Promise.resolve([])),
    getCollectingReasons: vi.fn(() => Promise.resolve([])),
    getTaxonomyCodes: vi.fn(() => Promise.resolve([]))
  };
});

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/mock-deploy-path'
    }
  }
}));

describe('TaxonomyPage Error Message', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
  });

  it('renders TaxonomyPage without crashing', () => {
    render(<TaxonomyPage />);
  });

  it('shows error alert with correct severity and text when trying to search without any optional filters set', async () => {
    const { noFilterSetted } = await import('../../utils/filtersValidation');
    (noFilterSetted as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<TaxonomyPage />);

    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    const errorAlert = screen.getByTestId('multifilters-error-text');
    expect(errorAlert).toBeInTheDocument();

    expect(errorAlert).toHaveAttribute('role', 'alert');
    expect(
      errorAlert.closest('[class*="MuiAlert-standardError"]')
    ).toBeInTheDocument();

    expect(errorAlert).toHaveTextContent('commons.filters.atLeastOneFilter');
  });

  it('does not show error alert when optional filters are properly set', async () => {
    const { noFilterSetted } = await import('../../utils/filtersValidation');
    (noFilterSetted as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<TaxonomyPage />);

    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    const errorAlert = screen.queryByTestId('multifilters-error-text');
    expect(errorAlert).not.toBeInTheDocument();
  });

  it('clears error when reset button is clicked', async () => {
    const { noFilterSetted } = await import('../../utils/filtersValidation');
    (noFilterSetted as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<TaxonomyPage />);

    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', {
      name: 'commons.filters.remove'
    });
    fireEvent.click(resetButton);

    expect(
      screen.queryByTestId('multifilters-error-text')
    ).not.toBeInTheDocument();
  });
});
