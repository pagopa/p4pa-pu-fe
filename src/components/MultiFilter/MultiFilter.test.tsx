import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import MultiFilter from './MultiFilter';
import { FilterMap } from '../../hooks/useMultiFilters';
import { COMPONENT_TYPE, FilterItem } from '../FilterContainer/FilterContainer';
import { selectedFilters, setSelectedFilters } from '../../store/FilterStore';

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
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: 'Search Field'
      }
    ]
  },
  name: {
    label: 'Name',
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: 'Name Field'
      }
    ]
  }
};

describe('MultiFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSelectedFilters(['search']);
  });

  it('invokes removeFilterRow with correct ID on remove button click', () => {
    // Start with both filters
    setSelectedFilters(['search', 'name']);

    render(<MultiFilter filterMap={mockFilterMap} />);

    // Verify initial render has both filters
    const removeButtons = screen.getAllByRole('button', { name: 'remove' });
    expect(removeButtons).toHaveLength(2);

    // Remove firs filter row
    fireEvent.click(removeButtons[0]);

    expect(selectedFilters.value).toEqual(['name']);
  });
});
