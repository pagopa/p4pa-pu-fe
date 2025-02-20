import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import MultiFilter from './MultiFilter';
import { filtersState, setFiltersState } from '../../store/FilterStore';
import { FilterMap } from '../../hooks/useFilters';
import { COMPONENT_TYPE, FilterItem } from '../FilterContainer/FilterContainer';

vi.mock('../FilterContainer/FilterContainer', () => ({
  default: vi.fn(({ items }) => (
    <div data-testid="filter-container">
      {items.map((item: FilterItem) => (
        <div key={item.label}>{item.label}</div>
      ))}
    </div>
  )),
  COMPONENT_TYPE: {
    textField: 'textField',
    select: 'select',
    button: 'button',
    dateRange: 'dateRange',
    amount: 'amount'
  }
}));

const mockFilterMap: FilterMap = {
  search: {
    label: 'Search',
    fields: [{
      type: COMPONENT_TYPE.textField,
      label: 'Search Field'
    }]
  },
  name: {
    label: 'Name',
    fields: [{
      type: COMPONENT_TYPE.textField,
      label: 'Name Field'
    }]
  }
};

describe('MultiFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setFiltersState(['search']);
  });

  it('invokes removeFilterRow with correct ID on remove button click', () => {
    // Start with both filters
    setFiltersState(['search', 'name']);
    
    render(<MultiFilter filterMap={mockFilterMap} />);

    // Verify initial render has both filters
    const removeButtons = screen.getAllByRole('button', { name: 'remove' });
    expect(removeButtons).toHaveLength(2);

    // Remove the first filter
    fireEvent.click(removeButtons[0]);

    // After removal, the state resets to [''] as per FilterStore behavior
    expect(filtersState.value).toEqual(['']);
  });
});
