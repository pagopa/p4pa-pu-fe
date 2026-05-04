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

  it('renders title with default h6 variant', () => {
    render(<Drawer open={true} onClose={mockOnClose} title="Test Drawer" />);

    const title = screen.getByText('Test Drawer');
    expect(title).toHaveClass('MuiTypography-h6');
  });

  it('renders title with custom variant when titleVariant is provided', () => {
    render(
      <Drawer
        open={true}
        onClose={mockOnClose}
        title="Test Drawer"
        titleVariant="overline"
      />
    );

    const title = screen.getByText('Test Drawer');
    expect(title).toHaveClass('MuiTypography-overline');
  });

  it('renders title with subtitle1 variant', () => {
    render(
      <Drawer
        open={true}
        onClose={mockOnClose}
        title="Test Drawer"
        titleVariant="subtitle1"
      />
    );

    const title = screen.getByText('Test Drawer');
    expect(title).toHaveClass('MuiTypography-subtitle1');
  });

  it('renders titleDecoration when provided', () => {
    render(
      <Drawer
        open={true}
        onClose={mockOnClose}
        title="Test Drawer"
        titleDecoration={<span data-testid="title-decoration">Icon</span>}
      />
    );

    expect(screen.getByTestId('title-decoration')).toBeTruthy();
  });

  it('renders children content', () => {
    render(
      <Drawer open={true} onClose={mockOnClose} title="Test Drawer">
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    );

    expect(screen.getByTestId('drawer-content')).toBeTruthy();
  });
});
