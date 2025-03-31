import { render, screen, fireEvent } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { Drawer } from '../Drawer';

describe('Drawer Component', () => {
  let mockOnClose: () => void;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  it('close drawer when close icon is clicked', () => {
    render(<Drawer open={true} onClose={mockOnClose} title="Test Drawer" />);

    const closeButton = screen.getByTestId('close-icon');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
