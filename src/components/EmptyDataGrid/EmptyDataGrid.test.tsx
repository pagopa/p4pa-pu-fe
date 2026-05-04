import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import EmptyDataGrid from './EmptyDataGrid';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';

i18nTestSetup({
  'commons.noData': 'Nessun dato disponibile',
  'commons.import': 'Importa',
  'commons.create': 'Crea nuovo'
});

describe('EmptyDataGrid', () => {
  it('should render the title', () => {
    render(<EmptyDataGrid title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render with Typography body2 variant', () => {
    render(<EmptyDataGrid title="Test Title" />);
    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('MuiTypography-body2');
  });

  it('should not render button when no action provided', () => {
    render(<EmptyDataGrid title="Test Title" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render action button with correct label', () => {
    const action = {
      label: 'Click me',
      onClick: vi.fn()
    };

    render(<EmptyDataGrid title="Test Title" action={action} />);
    expect(
      screen.getByRole('button', { name: 'Click me' })
    ).toBeInTheDocument();
  });

  it('should call onClick when button is clicked', () => {
    const onClickMock = vi.fn();
    const action = {
      label: 'Click me',
      onClick: onClickMock
    };

    render(<EmptyDataGrid title="Test Title" action={action} />);

    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should apply default variant "text" when not specified', () => {
    const action = {
      label: 'Click me',
      onClick: vi.fn()
    };

    render(<EmptyDataGrid title="Test Title" action={action} />);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('MuiButton-text');
  });

  it('should apply specified variant correctly', () => {
    const action = {
      label: 'Click me',
      onClick: vi.fn(),
      variant: 'outlined' as const
    };

    render(<EmptyDataGrid title="Test Title" action={action} />);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('MuiButton-outlined');
  });

  it('should apply custom styles without errors', () => {
    const customStyles = {
      container: { bgcolor: 'red' },
      content: { padding: 5 }
    };

    render(<EmptyDataGrid title="Test Title" customStyles={customStyles} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle title and action correctly', () => {
    const mockOnClick = vi.fn();
    const action = {
      label: 'Action Label',
      onClick: mockOnClick,
      variant: 'outlined' as const
    };

    render(<EmptyDataGrid title="Test Title" action={action} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Action Label' })
    ).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Action Label' });
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be focusable when action is present', () => {
    const action = {
      label: 'Focusable',
      onClick: vi.fn()
    };

    render(<EmptyDataGrid title="Test" action={action} />);

    const button = screen.getByRole('button', { name: 'Focusable' });
    button.focus();
    expect(button).toHaveFocus();
  });

  it('should work with translation keys', () => {
    render(<EmptyDataGrid title="commons.noData" />);
    expect(screen.getByText('commons.noData')).toBeInTheDocument();
  });

  it('should work with translated action labels', () => {
    const action = {
      label: 'commons.import',
      onClick: vi.fn()
    };

    render(<EmptyDataGrid title="commons.noData" action={action} />);
    expect(
      screen.getByRole('button', { name: 'commons.import' })
    ).toBeInTheDocument();
  });

  it('should have correct flex layout properties', () => {
    render(<EmptyDataGrid title="Test Title" />);

    const title = screen.getByText('Test Title');
    const container = title.closest('.MuiBox-root');

    expect(container).toBeInTheDocument();
  });

  it('should handle multiple buttons correctly', () => {
    const action = {
      label: 'Button Label',
      onClick: vi.fn()
    };

    render(<EmptyDataGrid title="Test Title" action={action} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Button Label');
  });

  it('should use correct text color', () => {
    render(<EmptyDataGrid title="Test Title" />);

    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('MuiTypography-root');
  });
});
