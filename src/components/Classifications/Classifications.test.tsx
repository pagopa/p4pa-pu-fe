import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { Classifications } from './Classifications';
import {
  filterValues,
  selectedFilters,
  initialFilterValues,
  noFilterIsSelected
} from '../../store/FilterStore';

// Mock react-router useNavigate:
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Classifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectedFilters.value = [];
    filterValues.value = { ...initialFilterValues };
    mockNavigate.mockClear();
  });

  it('renders all sections and buttons', () => {
    render(<Classifications />);
    expect(
      screen.getByText('commons.routes.CLASSIFICATIONS')
    ).toBeInTheDocument();
    expect(screen.getByText('classifications.search')).toBeInTheDocument();
    expect(
      screen.getByText('classifications.searchdescription')
    ).toBeInTheDocument();
    expect(screen.getByText('classifications.exportTitle')).toBeInTheDocument();
    expect(
      screen.getByText('classifications.exportDescription')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.search' })
    ).toBeInTheDocument();
  });

  it('does not show error alert initially', () => {
    render(<Classifications />);
    expect(screen.queryByTestId('multifilters-error-text')).toBeNull();
  });

  it('shows error alert when search clicked without filters', async () => {
    const peekSpy = vi.spyOn(noFilterIsSelected, 'peek').mockReturnValue(true);
    render(<Classifications />);
    fireEvent.click(screen.getByRole('button', { name: 'commons.search' }));

    await waitFor(() => {
      const alert = screen.getByTestId('multifilters-error-text');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert.textContent).toContain('commons.filters.atLeastOneFilter');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    peekSpy.mockRestore();
  });

  it('does not show error and navigates correctly when filters valid', async () => {
    selectedFilters.value = ['CLASSIFICATION_TYPE'];
    filterValues.value = {
      ...filterValues.value,
      CLASSIFICATION_TYPE: 'some-type'
    };

    const peekSpy = vi.spyOn(noFilterIsSelected, 'peek').mockReturnValue(false);
    render(<Classifications />);

    fireEvent.click(screen.getByRole('button', { name: 'commons.search' }));

    await waitFor(() => {
      expect(screen.queryByTestId('multifilters-error-text')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith(
        '/piattaformaunitaria/classifications/search-results/'
      );
    });

    peekSpy.mockRestore();
  });

  it('hides error alert when remove button clicked', async () => {
    const peekSpy = vi.spyOn(noFilterIsSelected, 'peek').mockReturnValue(true);
    render(<Classifications />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('multifilters-error-text')).toBeNull();
      expect(selectedFilters.value.length).toBe(0);
    });

    peekSpy.mockRestore();
  });
});
