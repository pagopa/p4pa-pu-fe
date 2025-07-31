import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { Classifications } from './Classifications';
import { useNavigate } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

const mockFilterValues = vi.hoisted(() => ({
  value: {},
  peek: vi.fn(() => ({}))
}));

const mockSelectedFilters = vi.hoisted(() => ({
  value: [],
  peek: vi.fn(() => [])
}));

const mockRemoveAllFilters = vi.hoisted(() => vi.fn());
const mockNoFilterIsSelected = vi.hoisted(() => ({
  peek: vi.fn(() => false)
}));

vi.mock('../../store/FilterStore', () => ({
  filterValues: mockFilterValues,
  selectedFilters: mockSelectedFilters
}));

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: () => ({
    filterMap: {},
    removeAllFilters: mockRemoveAllFilters,
    noFilterIsSelected: mockNoFilterIsSelected
  }),
  FilterCategory: {
    CLASSIFICATIONS: 'CLASSIFICATIONS'
  }
}));

describe('Classifications', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );

    mockFilterValues.value = {};
    mockSelectedFilters.value = [];
    mockNoFilterIsSelected.peek.mockReturnValue(false);
  });

  it('renders all sections and buttons', () => {
    render(<Classifications />);

    expect(screen.getByText('commons.routes.CLASSIFICATIONS')).toBeDefined();
    expect(screen.getByText('classifications.search')).toBeDefined();
    expect(screen.getByText('classifications.searchdescription')).toBeDefined();
    expect(screen.getByText('classifications.exportTitle')).toBeDefined();
    expect(screen.getByText('classifications.exportDescription')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.search' })
    ).toBeDefined();
  });

  it('does not show error alert initially', () => {
    render(<Classifications />);

    expect(screen.queryByTestId('multifilters-error-text')).toBeNull();
  });

  it('shows error alert when search is clicked without filters', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(false);

    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('multifilters-error-text')).toBeDefined();
    });
  });

  it('shows error alert when search is clicked without classification type', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(false);
    mockFilterValues.value = { SOME_OTHER_FILTER: '' };

    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('multifilters-error-text')).toBeDefined();
    });
  });

  it('does not show error alert when filters are properly set', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(true);
    mockFilterValues.value = { CLASSIFICATION_TYPE: 'some-type' };

    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/piattaformaunitaria/classifications/search-results/'
      );
    });

    expect(screen.queryByTestId('multifilters-error-text')).toBeNull();
  });

  it('hides error alert when remove button is clicked', async () => {
    mockNoFilterIsSelected.peek.mockReturnValue(false);

    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('multifilters-error-text')).toBeDefined();
    });

    const removeButton = screen.getByRole('button', {
      name: 'commons.filters.remove'
    });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('multifilters-error-text')).toBeNull();
    });
  });

  describe('Error Alert Content', () => {
    it('shows correct error message text', async () => {
      mockNoFilterIsSelected.peek.mockReturnValue(false);

      render(<Classifications />);

      const searchButton = screen.getByRole('button', {
        name: 'commons.search'
      });
      fireEvent.click(searchButton);

      await waitFor(() => {
        const alert = screen.getByTestId('multifilters-error-text');
        expect(alert).toBeDefined();
        expect(alert.textContent).toContain('commons.filters.atLeastOneFilter');
      });
    });

    it('shows alert with error severity', async () => {
      mockNoFilterIsSelected.peek.mockReturnValue(false);

      render(<Classifications />);

      const searchButton = screen.getByRole('button', {
        name: 'commons.search'
      });
      fireEvent.click(searchButton);

      await waitFor(() => {
        const alert = screen.getByTestId('multifilters-error-text');
        expect(alert.closest('[role="alert"]')).toBeDefined();
      });
    });
  });
});
