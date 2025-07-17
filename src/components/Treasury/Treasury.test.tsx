import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../__tests__/renderers';
import Treasury from './Treasury';
import { useNavigate } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

const mockNoFilterIsSelected = {
  peek: vi.fn()
};

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: () => ({
    filterMap: {},
    removeAllFilters: vi.fn(),
    noFilterIsSelected: mockNoFilterIsSelected
  }),
  FilterCategory: {
    TREASURY: 'TREASURY'
  }
}));

vi.mock('../../utils/filtersValidation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    noFilterSetted: vi.fn()
  };
});

describe('Treasury', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
  });

  it('renders all sections and buttons', () => {
    render(<Treasury />);

    expect(screen.getByText('commons.routes.TREASURY')).toBeDefined();
    expect(screen.getByText('treasury.description')).toBeDefined();
    expect(screen.getByText('treasury.search')).toBeDefined();
    expect(screen.getByText('treasury.searchdescription')).toBeDefined();
    expect(screen.getByText('treasury.importflowstitle')).toBeDefined();
    expect(screen.getByText('treasury.importflowsdescription')).toBeDefined();
    expect(screen.getByText('commons.importFlow')).toBeDefined();
    expect(screen.getByText('commons.showAllFlows')).toBeDefined();
  });

  it('shows error alert with correct severity and text when trying to filter without any filters set', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(false);

    render(<Treasury />);

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

  it('does not show error alert when no filters are selected and navigates correctly', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(true);

    render(<Treasury />);

    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    const errorAlert = screen.queryByTestId('multifilters-error-text');
    expect(errorAlert).not.toBeInTheDocument();

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        '/piattaformaunitaria/flows/treasury/search-results'
      )
    );
  });

  it('clears error when remove button is clicked', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(false);

    render(<Treasury />);

    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', {
      name: 'commons.filters.remove'
    });
    fireEvent.click(removeButton);

    expect(
      screen.queryByTestId('multifilters-error-text')
    ).not.toBeInTheDocument();
  });
});
