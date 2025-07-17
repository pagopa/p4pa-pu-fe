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
const mockNoFilterSelectedExcludingClassificationType = vi.hoisted(() => ({
  peek: vi.fn(() => true)
}));

vi.mock('../../store/FilterStore', () => ({
  filterValues: mockFilterValues,
  selectedFilters: mockSelectedFilters
}));

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: () => ({
    filterMap: {},
    removeAllFilters: mockRemoveAllFilters,
    noFilterSelectedExcludingClassificationType:
      mockNoFilterSelectedExcludingClassificationType
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
    mockNoFilterSelectedExcludingClassificationType.peek.mockReturnValue(true);
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
    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('multifilters-error-text')).toBeDefined();
    });
  });

  it('shows error alert when search is clicked without classification type', async () => {
    mockFilterValues.value = { SOME_OTHER_FILTER: 'value' };

    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('multifilters-error-text')).toBeDefined();
    });
  });

  it('does not show error alert when filters are properly set', async () => {
    mockFilterValues.value = { CLASSIFICATION_TYPE: 'some-type' };
    mockNoFilterSelectedExcludingClassificationType.peek.mockReturnValue(false);

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
