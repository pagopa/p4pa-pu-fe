import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TitleComponent from './TitleComponent';

describe('TitleComponent', () => {
  const defaultProps = {
    title: 'Test Title',
  };

  it('renders title correctly', () => {
    render(<TitleComponent {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeDefined();
  });

  it('renders description when provided', () => {
    const props = {
      ...defaultProps,
      description: 'Test Description',
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
          onActionClick: mockClickHandler,
        },
      ],
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
          onActionClick: mockClickHandler,
        },
      ],
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
        { buttonText: 'Button 2', onActionClick: vi.fn() },
      ],
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
        },
      ],
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
        },
      ],
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
        },
      ],
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
        },
      ],
    };
    render(<TitleComponent {...props} />);
    
    const button = screen.getByText('Default Color Button');
    expect(button.className).toContain('MuiButton-colorPrimary');
  });
});
