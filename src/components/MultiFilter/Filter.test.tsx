import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import { Filter } from './Filter';
import { FilterItem } from '../FilterContainer/FilterContainer';

vi.mock('../FilterContainer/FilterContainer', () => ({
  default: vi.fn(({ items }) => (
    <div data-testid="filter-container">
      {items.map((item: FilterItem) => (
        <div key={item.label}>{item.label}</div>
      ))}
    </div>
  ))
}));

const mockFilterMap = {
  search: { label: 'Search', fields: [{ type: 0, label: 'Search Field' }] },
  name: { label: 'Name', fields: [{ type: 0, label: 'Name Field' }] }
};

describe('Filter Component', () => {
  const onChange = vi.fn();
  const value = 'search';
  const selectedFilters = ['name'];

  it('renders select with options from filterMap', () => {
    render(
      <Filter
        filterMap={mockFilterMap}
        onChange={onChange}
        value={value}
        selectedFilters={selectedFilters}
      />
    );

    // Open the Select dropdown
    const selectElement = screen.getByRole('combobox');
    fireEvent.mouseDown(selectElement);

    // Verify that the options are rendered correctly
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Search');
    expect(options[1]).toHaveTextContent('Name');

    // Verify that the selectedFilters disable the correct option
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders fields from the selected filter', () => {
    render(
      <Filter
        filterMap={mockFilterMap}
        onChange={onChange}
        value={value}
        selectedFilters={selectedFilters}
      />
    );

    // Verify that the FilterContainer is rendered with the correct fields
    const filterContainer = screen.getByTestId('filter-container');
    expect(filterContainer).toBeInTheDocument();

    // Verify that the fields for the selected value are rendered
    const searchField = screen.getByText('Search Field');
    expect(searchField).toBeInTheDocument();
  });

  it('calls the onChange handler when the select value changes', () => {
    render(
      <Filter
        filterMap={mockFilterMap}
        onChange={onChange}
        value={value}
        selectedFilters={selectedFilters}
      />
    );

    // Open the Select dropdown
    const selectElement = screen.getByRole('combobox');
    fireEvent.mouseDown(selectElement);

    // Select an option from the dropdown
    const optionToSelect = screen.getByText('Name');
    fireEvent.click(optionToSelect);

    // Verify that the onChange handler is called
    expect(onChange).toHaveBeenCalled();
  });
});
