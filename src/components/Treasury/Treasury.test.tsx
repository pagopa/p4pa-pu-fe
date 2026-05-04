import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, render, waitFor } from '../../__tests__/renderers';
import Treasury from './Treasury';
import {
  filterValues,
  initialFilterValues,
  noFilterIsSelected,
  selectedFilters
} from '../../store/FilterStore';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Treasury', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store signals/state before each test
    filterValues.value = { ...initialFilterValues };
    selectedFilters.value = [];
    mockNavigate.mockClear();
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

  it('shows error alert when trying to search without valid filters', async () => {
    // Simulate invalid filter state: empty selected filters so isValid false
    selectedFilters.value = [];
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
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not show error and navigates correctly when filters are valid', async () => {
    // Set up real store state with filters selected
    selectedFilters.value = ['AMOUNT'];
    filterValues.value = {
      ...filterValues.value,
      AMOUNT: 100 // example value to simulate filter set
    };

    const peekSpy = vi.spyOn(noFilterIsSelected, 'peek').mockReturnValue(false);

    render(<Treasury />);
    const searchButton = screen.getByRole('button', {
      name: 'commons.filters.filterResults'
    });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId('multifilters-error-text')
      ).not.toBeInTheDocument();
    });

    expect(mockNavigate).toHaveBeenCalledWith(expect.any(String));

    peekSpy.mockRestore();
  });

  it('clears error when remove filters button is clicked', () => {
    selectedFilters.value = [];
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
    expect(selectedFilters.value.length).toBe(0);
  });
});
