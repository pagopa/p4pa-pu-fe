import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import Reporting from './Reporting';
import { useNavigate, generatePath } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
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

describe('Reporting', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (generatePath as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );
  });

  it('renders the title and description', () => {
    render(<Reporting />);

    expect(screen.getByText('reporting.title')).toBeInTheDocument();
    expect(screen.getByText('reporting.description')).toBeInTheDocument();
  });

  it('renders the SearchCard with filterContext="REPORTING"', () => {
    render(<Reporting />);

    expect(
      screen.getByText('reporting.searchTitleContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByText('reporting.searchDescriptionContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.filters.filterResults' })
    ).toBeInTheDocument();
  });

  it('shows error alert with correct severity and text when trying to filter without any filters set', async () => {
    const { noFilterSetted } = await import('../../utils/filtersValidation');
    (noFilterSetted as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<Reporting />);

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

  it('does not show error alert when filters are properly set', async () => {
    const { noFilterSetted } = await import('../../utils/filtersValidation');
    (noFilterSetted as ReturnType<typeof vi.fn>).mockReturnValue(false);

    render(<Reporting />);

    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    const errorAlert = screen.queryByTestId('multifilters-error-text');
    expect(errorAlert).not.toBeInTheDocument();

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        state: {
          filters: {}
        }
      })
    );
  });
});
