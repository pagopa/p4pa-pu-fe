import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import CustomDrawer from './CustomDrawer';

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
      <CustomDrawer
        open={true}
        onClose={mockOnClose}
        title="Test Drawer"
        multiFilterConfig={{
          enabled: true,
          selectLabel: 'Select Option',
          inputLabel: { label: 'Input Label' },
          selectOptions: [{ label: 'Option 1', value: 'option1' }],
        }}
      />
    );
  
    const selectLabels = screen.getAllByText('Select Option');
    expect(selectLabels[0]).toHaveTextContent('Select Option');
  });  
});
