import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import MultiFilter from './MultiFilter';
import { filtersState, setFiltersState } from '../../store/FilterStore';
import { FilterMap } from '../../hooks/useFilters';

const mockFilterMap: FilterMap = {
  search: { label: 'Search', fields: [{ type: 0, label: 'Search Field' }] },
  name: { label: 'Name', fields: [{ type: 0, label: 'Name Field' }] }
};

describe('MultiFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setFiltersState(['search']);
  });

  it('renders filters based on store state', () => {
    render(<MultiFilter filterMap={mockFilterMap} />);

    // filter components is rendered with the correct filters
    const filterComponents = screen.getAllByTestId('filter-component');
    expect(filterComponents).toHaveLength(1);
  });

  it('renders remove buttons for multiple filters', () => {
    setFiltersState(['search', 'name']);

    render(<MultiFilter filterMap={mockFilterMap} />);

    // Verify that remove buttons are rendered for each filter
    const removeButtons = screen.getAllByRole('button', { name: 'remove' });
    expect(removeButtons).toHaveLength(2);
  });

  it('hides remove button for a single filter', () => {
    render(<MultiFilter filterMap={mockFilterMap} />);

    // Verify that no remove button is rendered for a single filter
    const removeButton = screen.queryByRole('button', { name: 'remove' });
    expect(removeButton).not.toBeInTheDocument();
  });

  it('invokes addFilterRow on add button click', () => {
    render(<MultiFilter filterMap={mockFilterMap} />);

    const addButton = screen.getByRole('button', { name: /commons.addfilter/i });
    fireEvent.click(addButton);

    expect(filtersState.value).toHaveLength(2);
  });

  it('invokes removeFilterRow with correct ID on remove button click', () => {
    setFiltersState(['search', 'name']);

    render(<MultiFilter filterMap={mockFilterMap} />);

    // Click the first remove button
    const removeButtons = screen.getAllByRole('button', { name: 'remove' });
    fireEvent.click(removeButtons[0]);

    expect(filtersState.value).toStrictEqual(['name']);
  });

  it('disables add button at maximum filters', () => {
    setFiltersState(['search', 'name']);

    render(<MultiFilter filterMap={mockFilterMap} />);

    // Verify that the add button is disabled
    const addButton = screen.getByRole('button', { name: /commons.addfilter/i });
    expect(addButton).toBeDisabled();
  });
});
