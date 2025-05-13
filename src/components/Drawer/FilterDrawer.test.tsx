import { render, renderHook, screen } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { FilterDrawer } from './FilterDrawer';
import { useMultiFilters } from '../../hooks/useMultiFilters';

vi.mock('../../hooks/useFilters', () => ({
  useFilters: () => ({
    AMOUNT: {
      label: 'AMOUNT',
      fields: [{ type: COMPONENT_TYPE.textField, label: 'commons.searchFor' }]
    }
  })
}));

describe('Drawer Component', () => {
  let mockOnClose: () => void;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  it('renders drawer with multiFilter', () => {
    const { result } = renderHook(() => useMultiFilters());
    render(
      <FilterDrawer
        open={true}
        onClose={mockOnClose}
        title="Test Drawer"
        filterMap={result.current.filterMap}
      />
    );

    const selectLabels = screen.getAllByText('commons.addfilter');
    expect(selectLabels[0]).toBeTruthy();
  });
});
