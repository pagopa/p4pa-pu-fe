import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import CustomDrawer from './CustomDrawer';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { useFilters } from '../../hooks/useFilters';
import { StoreProvider } from '../../store/GlobalStore';

vi.mock('../../hooks/useFilters', () => ({
  useFilters: () => ({
    FILTER_TYPE_1: {
      label: 'Filtro 1',
      fields: [
        { type: COMPONENT_TYPE.textField, label: 'commons.searchFor' }
      ]
    }
  })
}));

describe('CustomDrawer Component', () => {
  let mockOnClose: () => void;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  it('renders drawer with title and fields', () => {
    render(
      <CustomDrawer
        open={true}
        onClose={mockOnClose}
        title='Test Drawer'
        fields={[
          { id: '1', label: 'Field 1', value: 'Value 1' },
          { id: '2', label: 'Field 2', value: 'Value 2' },
        ]}
      />
    );

    expect(screen.getByText('Test Drawer')).toBeDefined();
    expect(screen.getByText('Field 1')).toBeDefined();
    expect(screen.getByText('Value 1')).toBeDefined();
    expect(screen.getByText('Field 2')).toBeDefined();
    expect(screen.getByText('Value 2')).toBeDefined();
  });

  it('close drawer when close icon is clicked', () => {
    render(<CustomDrawer open={true} onClose={mockOnClose} title='Test Drawer' />);

    const closeButton = screen.getByTestId('close-icon');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders drawer with multiFilter', () => {    
    render(
      <StoreProvider>
        <CustomDrawer
          open={true}
          onClose={mockOnClose}
          title="Test Drawer"
          multiFilterConfig={useFilters()}
        />
      </StoreProvider>
    );
  
    const selectLabels = screen.getAllByText('commons.searchFor');
    expect(selectLabels[0]).toBeTruthy();
  });  
});