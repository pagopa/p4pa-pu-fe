import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MultiFilter from './MultiFilter';
import { render, screen } from '../../__tests__/renderers';
import { MAX_FILTERS, setFiltersState, filtersState } from '../../store/FilterStore';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const mockFilterMap = {
  search: { label: 'Search', fields: [{ type: 0, label: 'Search Field' }] }
};

describe('MultiFilter Component', () => {
  it('renders filters based on store state', () => {
    setFiltersState([1, 2]);
    render(<MultiFilter filterMap={mockFilterMap} />);
    expect(screen.getAllByTestId('filter-component')).toHaveLength(2);
  });

  it('renders remove buttons for multiple filters', () => {
    setFiltersState([1, 2]);
    render(<MultiFilter filterMap={mockFilterMap} />);
    expect(screen.getAllByRole('button', { name: 'remove' })).toHaveLength(2);
  });

  it('hides remove button for a single filter', () => {
    setFiltersState([1]);
    render(<MultiFilter filterMap={mockFilterMap} />);
    expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument();
  });

  it('invokes addFilterRow on add button click', async () => {
    setFiltersState([1]);
    render(<MultiFilter filterMap={mockFilterMap} />);
    await userEvent.click(screen.getByRole('button', { name: /commons.addfilter/i }));
    expect(filtersState.value).toHaveLength(2);
  });

  it('invokes removeFilterRow with correct ID on remove button click', async () => {
    setFiltersState([0, 1, 2]);
    render(<MultiFilter filterMap={mockFilterMap} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);
    expect(filtersState.value).toHaveLength(2);
  });

  it('disables add button at maximum filters', () => {
    setFiltersState(Array(MAX_FILTERS).fill(0));
    render(<MultiFilter filterMap={mockFilterMap} />);
    expect(screen.getByRole('button', { name: /commons.addfilter/i })).toBeDisabled();
  });
});
