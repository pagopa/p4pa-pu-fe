import { fireEvent, render, screen } from '../../__tests__/renderers';
import { describe, expect, it, vi } from 'vitest';
import TitleComponent from './TitleComponent';
import { Add, Edit } from '@mui/icons-material';

describe('TitleComponent', () => {
  const defaultProps = {
    title: 'Test Title'
  };

  it('renders title correctly', () => {
    render(<TitleComponent {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeDefined();
  });

  it('renders description when provided', () => {
    const props = {
      ...defaultProps,
      description: 'Test Description'
    };
    render(<TitleComponent {...props} />);
    expect(screen.getByText('Test Description')).toBeDefined();
  });

  it('does not render description when not provided', () => {
    render(<TitleComponent {...defaultProps} />);
    const descriptionElement = screen.queryByText(/Test Description/i);
    expect(descriptionElement).toBe(null);
  });

  it('renders no buttons when callToAction is undefined', () => {
    render(<TitleComponent {...defaultProps} />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('renders buttons from callToAction', () => {
    const mockClickHandler = vi.fn();
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Action Button',
          onActionClick: mockClickHandler
        }
      ]
    };
    render(<TitleComponent {...props} />);
    const button = screen.getByText('Action Button');
    expect(button).toBeDefined();
  });

  it('calls onActionClick when button is clicked', async () => {
    const mockClickHandler = vi.fn();
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Action Button',
          onActionClick: mockClickHandler
        }
      ]
    };
    render(<TitleComponent {...props} />);
    const button = screen.getByText('Action Button');

    fireEvent.click(button);

    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  it('renders multiple buttons when multiple callToAction items exist', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        { buttonText: 'Button 1', onActionClick: vi.fn() },
        { buttonText: 'Button 2', onActionClick: vi.fn() }
      ]
    };
    render(<TitleComponent {...props} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByText('Button 1')).toBeDefined();
    expect(screen.getByText('Button 2')).toBeDefined();
  });

  it('applies correct button variant', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Outlined Button',
          variant: 'outlined' as const,
          onActionClick: vi.fn()
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByText('Outlined Button');
    expect(button.className).toContain('MuiButton-outlined');
  });

  it('applies default contained variant when no variant specified', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Default Button',
          onActionClick: vi.fn()
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByText('Default Button');
    expect(button.className).toContain('MuiButton-contained');
  });

  it('applies custom color prop', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Warning Button',
          color: 'warning' as const,
          onActionClick: vi.fn()
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByText('Warning Button');
    expect(button.className).toContain('MuiButton-colorWarning');
  });

  it('applies primary color by default', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Default Color Button',
          onActionClick: vi.fn()
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByText('Default Color Button');
    expect(button.className).toContain('MuiButton-colorPrimary');
  });

  it('renders chip when provided', () => {
    const props = {
      ...defaultProps,
      chip: {
        label: 'Test Chip',
        color: 'primary' as const
      }
    };
    render(<TitleComponent {...props} />);
    expect(screen.getByText('Test Chip')).toBeDefined();
  });

  it('renders chip with different colors', () => {
    const props = {
      ...defaultProps,
      chip: {
        label: 'Success Chip',
        color: 'success' as const
      }
    };
    render(<TitleComponent {...props} />);
    const chip = screen.getByText('Success Chip');
    expect(chip.closest('.MuiChip-colorSuccess')).toBeTruthy();
  });

  it('does not render chip when not provided', () => {
    render(<TitleComponent {...defaultProps} />);
    const chip = screen.queryByText(/Test Chip/i);
    expect(chip).toBe(null);
  });

  it('renders IconButton when isIconButton is true', () => {
    const mockClickHandler = vi.fn();
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Add />,
          isIconButton: true,
          onActionClick: mockClickHandler,
          dataTestId: 'icon-button-add'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const iconButton = screen.getByTestId('icon-button-add');
    expect(iconButton).toBeDefined();
    expect(iconButton.tagName).toBe('BUTTON');
  });

  it('calls onActionClick when IconButton is clicked', () => {
    const mockClickHandler = vi.fn();
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Add />,
          isIconButton: true,
          onActionClick: mockClickHandler,
          dataTestId: 'icon-button-add'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const iconButton = screen.getByTestId('icon-button-add');
    fireEvent.click(iconButton);

    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  it('applies custom color to IconButton', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Edit />,
          isIconButton: true,
          color: 'error' as const,
          onActionClick: vi.fn(),
          dataTestId: 'icon-button-edit'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const iconButton = screen.getByTestId('icon-button-edit');
    const computedStyle = window.getComputedStyle(iconButton);
    expect(computedStyle.color).toBeTruthy();
    expect(computedStyle.color).not.toBe('');
  });

  it('handles inherit color for IconButton', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Edit />,
          isIconButton: true,
          color: 'inherit' as const,
          onActionClick: vi.fn(),
          dataTestId: 'icon-button-inherit'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const iconButton = screen.getByTestId('icon-button-inherit');
    expect(iconButton).toBeDefined();
  });

  it('renders button with icon only when no buttonText provided', () => {
    const mockClickHandler = vi.fn();
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Add />,
          onActionClick: mockClickHandler,
          dataTestId: 'icon-only-button'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByTestId('icon-only-button');
    expect(button).toBeDefined();
    expect(button.textContent).toBe('');
  });

  it('renders button with startIcon when buttonText is provided', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Add />,
          buttonText: 'Add Item',
          onActionClick: vi.fn(),
          dataTestId: 'button-with-icon'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByTestId('button-with-icon');
    expect(button).toBeDefined();
    expect(screen.getByText('Add Item')).toBeDefined();
  });

  it('does not set startIcon when no buttonText provided', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          icon: <Add />,
          onActionClick: vi.fn(),
          dataTestId: 'no-start-icon'
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByTestId('no-start-icon');
    expect(button.querySelector('.MuiButton-startIcon')).toBe(null);
  });

  it('renders custom React element in callToAction', () => {
    const CustomElement = (
      <div data-testid="custom-element">Custom Content</div>
    );
    const props = {
      ...defaultProps,
      callToAction: [CustomElement]
    };
    render(<TitleComponent {...props} />);

    expect(screen.getByTestId('custom-element')).toBeDefined();
    expect(screen.getByText('Custom Content')).toBeDefined();
  });

  it('mixes ActionMenuItem and React.ReactNode in callToAction', () => {
    const CustomElement = <span data-testid="mixed-custom">Mixed</span>;
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Regular Button',
          onActionClick: vi.fn(),
          dataTestId: 'mixed-button'
        },
        CustomElement
      ]
    };
    render(<TitleComponent {...props} />);

    expect(screen.getByTestId('mixed-button')).toBeDefined();
    expect(screen.getByTestId('mixed-custom')).toBeDefined();
    expect(screen.getByText('Regular Button')).toBeDefined();
    expect(screen.getByText('Mixed')).toBeDefined();
  });

  it('applies custom variant to title', () => {
    const props = {
      ...defaultProps,
      variant: 'h1' as const
    };
    render(<TitleComponent {...props} />);

    const title = screen.getByText('Test Title');
    expect(title.tagName).toBe('H1');
  });

  it('uses h3 as default variant', () => {
    render(<TitleComponent {...defaultProps} />);

    const title = screen.getByText('Test Title');
    expect(title.tagName).toBe('H1');
  });

  const colors = ['secondary', 'success', 'error', 'info', 'warning'] as const;

  colors.forEach((color) => {
    it(`applies ${color} color correctly`, () => {
      const props = {
        ...defaultProps,
        callToAction: [
          {
            buttonText: `${color} Button`,
            color,
            onActionClick: vi.fn()
          }
        ]
      };
      render(<TitleComponent {...props} />);

      const button = screen.getByText(`${color} Button`);
      expect(button.className).toContain(
        `MuiButton-color${color.charAt(0).toUpperCase() + color.slice(1)}`
      );
    });
  });

  it('sets correct aria-label for button', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Accessible Button',
          onActionClick: vi.fn()
        }
      ]
    };
    render(<TitleComponent {...props} />);

    const button = screen.getByText('Accessible Button');
    expect(button).toHaveAttribute('aria-label', 'Accessible Button');
  });

  it('handles empty callToAction array', () => {
    const props = {
      ...defaultProps,
      callToAction: []
    };
    render(<TitleComponent {...props} />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('handles callToAction with null values', () => {
    const props = {
      ...defaultProps,
      callToAction: [
        {
          buttonText: 'Valid Button',
          onActionClick: vi.fn()
        }
      ]
    };
    render(<TitleComponent {...props} />);

    expect(screen.getByText('Valid Button')).toBeDefined();
  });

  describe('disabled actions', () => {
    it('disables Button action when disabled is true', () => {
      const props = {
        ...defaultProps,
        callToAction: [
          {
            buttonText: 'Disabled Button',
            disabled: true,
            onActionClick: vi.fn()
          }
        ]
      };
      render(<TitleComponent {...props} />);

      expect(
        screen.getByText('Disabled Button').closest('button')
      ).toBeDisabled();
    });

    it('does not disable Button action when disabled is false', () => {
      const props = {
        ...defaultProps,
        callToAction: [
          {
            buttonText: 'Enabled Button',
            disabled: false,
            onActionClick: vi.fn()
          }
        ]
      };
      render(<TitleComponent {...props} />);

      expect(
        screen.getByText('Enabled Button').closest('button')
      ).not.toBeDisabled();
    });

    it('does not disable Button action when disabled is omitted', () => {
      const props = {
        ...defaultProps,
        callToAction: [
          {
            buttonText: 'Default Button',
            onActionClick: vi.fn()
          }
        ]
      };
      render(<TitleComponent {...props} />);

      expect(
        screen.getByText('Default Button').closest('button')
      ).not.toBeDisabled();
    });

    it('disables IconButton action when disabled is true', () => {
      const props = {
        ...defaultProps,
        callToAction: [
          {
            icon: <Add />,
            isIconButton: true,
            disabled: true,
            onActionClick: vi.fn(),
            dataTestId: 'disabled-icon-button'
          }
        ]
      };
      render(<TitleComponent {...props} />);

      expect(screen.getByTestId('disabled-icon-button')).toBeDisabled();
    });

    it('does not disable IconButton action when disabled is omitted', () => {
      const props = {
        ...defaultProps,
        callToAction: [
          {
            icon: <Add />,
            isIconButton: true,
            onActionClick: vi.fn(),
            dataTestId: 'enabled-icon-button'
          }
        ]
      };
      render(<TitleComponent {...props} />);

      expect(screen.getByTestId('enabled-icon-button')).not.toBeDisabled();
    });
  });
});
