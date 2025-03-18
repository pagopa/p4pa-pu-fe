import { render, screen } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { FilterDrawer } from './FilterDrawer';
import { useFilters } from '../../hooks/useFilters';

vi.mock('../../hooks/useFilters', () => ({
  useFilters: () => ({
    FILTER_TYPE_1: {
      label: 'Filtro 1',
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
    render(
      <FilterDrawer
        open={true}
        onClose={mockOnClose}
        title="Test Drawer"
        filterMap={useFilters()}
      />
    );

    const selectLabels = screen.getAllByText('commons.searchFor');
    expect(selectLabels[0]).toBeTruthy();
  });
});
