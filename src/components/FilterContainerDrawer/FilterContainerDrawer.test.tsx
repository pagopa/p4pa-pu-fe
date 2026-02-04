import { render, screen, fireEvent } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { FilterContainerDrawer } from './FilterContainerDrawer';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';

describe('FilterContainerDrawer Component', () => {
  let mockOnClose: () => void;
  let mockOnChange: (id: string, value: unknown) => void;
  let mockOnSubmit: () => void;

  const mockItems = [
    {
      type: COMPONENT_TYPE.textField,
      label: 'Search IUV',
      gridWidth: 6
    },
    {
      type: COMPONENT_TYPE.textField,
      label: 'Fiscal Code',
      gridWidth: 6
    }
  ];

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnChange = vi.fn();
    mockOnSubmit = vi.fn();
  });

  it('renders drawer with filter items', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
      />
    );

    expect(screen.getByTestId('drawer')).toBeTruthy();
    expect(screen.getByTestId('filter-container')).toBeTruthy();
  });

  it('closes drawer when close icon is clicked', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
      />
    );

    const closeButton = screen.getByTestId('close-icon');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders buttons when provided', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        buttons={[
          { buttonText: 'Search', variant: 'contained' },
          { buttonText: 'Clear', variant: 'text' }
        ]}
      />
    );

    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getByText('Clear')).toBeTruthy();
  });

  it('wraps content in form when onSubmit is provided', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        onSubmit={mockOnSubmit}
        buttons={[{ buttonText: 'Submit', variant: 'contained' }]}
      />
    );

    const formElement = document.querySelector('form');
    expect(formElement).toBeTruthy();
    expect(formElement).toHaveAttribute('novalidate');
  });

  it('calls onSubmit when form is submitted', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        onSubmit={mockOnSubmit}
        buttons={[{ buttonText: 'Submit', variant: 'contained' }]}
      />
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls button onClick for non-submit buttons', () => {
    const mockClearClick = vi.fn();

    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        onSubmit={mockOnSubmit}
        buttons={[
          { buttonText: 'Search', variant: 'contained' },
          { buttonText: 'Clear', variant: 'text', onClick: mockClearClick }
        ]}
      />
    );

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockClearClick).toHaveBeenCalled();
  });

  it('forces gridWidth to 12 for vertical layout', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
      />
    );

    const filterContainer = screen.getByTestId('filter-container');
    const gridItems = filterContainer.querySelectorAll('.MuiGrid-item');

    gridItems.forEach((item) => {
      expect(item.classList.contains('MuiGrid-grid-xs-12')).toBe(true);
    });
  });

  it('passes values and onChange to FilterContainer', () => {
    const values = { searchiuv: 'test-value' };

    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        values={values}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue('test-value');
    expect(input).toBeTruthy();
  });

  it('shows error message when showError is true', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        showError={true}
      />
    );

    expect(screen.getByTestId('alert-filter-error')).toBeTruthy();
  });

  it('does not show error message when showError is false', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={mockItems}
        showError={false}
      />
    );

    expect(screen.queryByTestId('alert-filter-error')).toBeNull();
  });

  it('passes titleVariant to Drawer', () => {
    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        titleVariant="overline"
        items={mockItems}
      />
    );

    const title = screen.getByText('Filters');
    expect(title).toHaveClass('MuiTypography-overline');
  });

  it('filters out button items from filter list', () => {
    const itemsWithButton = [
      ...mockItems,
      {
        type: COMPONENT_TYPE.button,
        label: 'Search Button',
        gridWidth: 12
      }
    ];

    render(
      <FilterContainerDrawer
        open={true}
        onClose={mockOnClose}
        title="Filters"
        items={itemsWithButton}
      />
    );

    expect(screen.queryByRole('button', { name: 'Search Button' })).toBeNull();
  });
});
