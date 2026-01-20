import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import FilterContainer, { COMPONENT_TYPE, FilterItem } from './FilterContainer';

describe('FilterContainer', () => {
  describe('TextField', () => {
    const textFieldItem: FilterItem = {
      type: COMPONENT_TYPE.textField,
      label: 'Search IUV',
      id: 'iuv'
    };

    it('renders a text field', () => {
      render(<FilterContainer items={[textFieldItem]} />);

      expect(screen.getByLabelText('Search IUV')).toBeInTheDocument();
    });

    it('displays the value from values prop', () => {
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{ iuv: 'ABC123' }}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByLabelText('Search IUV')).toHaveValue('ABC123');
    });

    it('calls onChange when typing', () => {
      const onChange = vi.fn();
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{}}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Search IUV');
      fireEvent.change(input, { target: { value: 'test value' } });

      expect(onChange).toHaveBeenCalledWith('iuv', 'test value');
    });

    it('trims whitespace on blur with onChange prop', () => {
      const onChange = vi.fn();
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{ iuv: '  ABC123  ' }}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Search IUV');
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith('iuv', 'ABC123');
    });

    it('trims whitespace on blur with item onChange', () => {
      const itemOnChange = vi.fn();
      const textFieldWithOnChange: FilterItem = {
        type: COMPONENT_TYPE.textField,
        label: 'Search IUV',
        id: 'iuv',
        value: '  ABC123  ',
        onChange: itemOnChange
      };

      render(<FilterContainer items={[textFieldWithOnChange]} />);

      const input = screen.getByLabelText('Search IUV');
      fireEvent.blur(input);

      expect(itemOnChange).toHaveBeenCalled();
      const calledEvent = itemOnChange.mock.calls[0][0];
      expect(calledEvent.target.value).toBe('ABC123');
    });

    it('does not call onChange on blur if value is already trimmed', () => {
      const onChange = vi.fn();
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{ iuv: 'ABC123' }}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Search IUV');
      fireEvent.blur(input);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('preserves spaces in the middle of the string', () => {
      const onChange = vi.fn();
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{ iuv: '  Test Redirect Name  ' }}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Search IUV');
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith('iuv', 'Test Redirect Name');
    });

    it('displays field error when present', () => {
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{ iuv: 'invalid', iuv_error: 'Invalid IUV format' }}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('Invalid IUV format')).toBeInTheDocument();
    });

    it('clears error when user starts typing', () => {
      const onChange = vi.fn();
      render(
        <FilterContainer
          items={[textFieldItem]}
          values={{ iuv: 'invalid', iuv_error: 'Invalid IUV format' }}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Search IUV');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalledWith('iuv_error', '');
      expect(onChange).toHaveBeenCalledWith('iuv', 'new value');
    });

    it('generates fieldId from label if id is not provided', () => {
      const itemWithoutId: FilterItem = {
        type: COMPONENT_TYPE.textField,
        label: 'Search Field'
      };
      const onChange = vi.fn();

      render(
        <FilterContainer
          items={[itemWithoutId]}
          values={{}}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Search Field');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onChange).toHaveBeenCalledWith('searchfield', 'test');
    });
  });

  describe('Select', () => {
    const selectItem: FilterItem = {
      type: COMPONENT_TYPE.select,
      label: 'Status',
      id: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    };

    it('renders a select field', () => {
      render(<FilterContainer items={[selectItem]} />);

      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('calls onChange when selecting an option', async () => {
      const onChange = vi.fn();
      render(
        <FilterContainer items={[selectItem]} values={{}} onChange={onChange} />
      );

      const select = screen.getByRole('combobox', { name: 'Status' });
      fireEvent.mouseDown(select);

      const option = await screen.findByRole('option', { name: 'Active' });
      fireEvent.click(option);

      expect(onChange).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('Button', () => {
    const buttonItem: FilterItem = {
      type: COMPONENT_TYPE.button,
      label: 'Search'
    };

    it('renders a button', () => {
      render(<FilterContainer items={[buttonItem]} />);

      expect(
        screen.getByRole('button', { name: 'Search' })
      ).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      const buttonWithClick: FilterItem = {
        type: COMPONENT_TYPE.button,
        label: 'Search',
        onClick
      };

      render(<FilterContainer items={[buttonWithClick]} />);

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalled();
    });

    it('renders as submit button when onSubmit is provided', () => {
      render(<FilterContainer items={[buttonItem]} onSubmit={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Search' });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('does not call onClick when button is submit type', () => {
      const onClick = vi.fn();
      const buttonWithClick: FilterItem = {
        type: COMPONENT_TYPE.button,
        label: 'Search',
        onClick
      };

      render(<FilterContainer items={[buttonWithClick]} onSubmit={vi.fn()} />);

      const button = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Amount', () => {
    const amountItem: FilterItem = {
      type: COMPONENT_TYPE.amount,
      label: 'Amount',
      id: 'amount'
    };

    it('renders an amount field', () => {
      render(<FilterContainer items={[amountItem]} />);

      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.getByTestId('EuroRoundedIcon')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
      const onChange = vi.fn();
      render(
        <FilterContainer items={[amountItem]} values={{}} onChange={onChange} />
      );

      const input = screen.getByLabelText('Amount');
      fireEvent.change(input, { target: { value: '100' } });

      expect(onChange).toHaveBeenCalledWith('amount', '100');
    });
  });

  describe('Form submission', () => {
    it('wraps content in form when onSubmit is provided', () => {
      render(
        <FilterContainer
          items={[{ type: COMPONENT_TYPE.textField, label: 'Test' }]}
          onSubmit={vi.fn()}
        />
      );

      expect(
        screen.getByTestId('filter-container').closest('form')
      ).toBeInTheDocument();
    });

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn();
      const items: Array<FilterItem> = [
        { type: COMPONENT_TYPE.textField, label: 'Test' },
        { type: COMPONENT_TYPE.button, label: 'Submit' }
      ];

      render(<FilterContainer items={items} onSubmit={onSubmit} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(button);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('prevents default form submission', () => {
      const onSubmit = vi.fn();
      const items: Array<FilterItem> = [
        { type: COMPONENT_TYPE.textField, label: 'Test' },
        { type: COMPONENT_TYPE.button, label: 'Submit' }
      ];

      render(<FilterContainer items={items} onSubmit={onSubmit} />);

      const form = screen.getByTestId('filter-container').closest('form')!;
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
      });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Grid layout', () => {
    it('applies custom grid width to items', () => {
      const items: Array<FilterItem> = [
        { type: COMPONENT_TYPE.textField, label: 'Field 1', gridWidth: 6 },
        { type: COMPONENT_TYPE.textField, label: 'Field 2', gridWidth: 6 }
      ];

      render(<FilterContainer items={items} />);

      const gridItems = screen
        .getByTestId('filter-container')
        .querySelectorAll('.MuiGrid-item');
      expect(gridItems).toHaveLength(2);
    });

    it('applies custom sx prop to grid container', () => {
      render(
        <FilterContainer
          items={[{ type: COMPONENT_TYPE.textField, label: 'Test' }]}
          sx={{ marginTop: 2 }}
        />
      );

      expect(screen.getByTestId('filter-container')).toBeInTheDocument();
    });
  });

  describe('Multiple items', () => {
    it('renders multiple filter items', () => {
      const items: Array<FilterItem> = [
        { type: COMPONENT_TYPE.textField, label: 'IUV', id: 'iuv' },
        { type: COMPONENT_TYPE.textField, label: 'IUD', id: 'iud' },
        {
          type: COMPONENT_TYPE.select,
          label: 'Status',
          id: 'status',
          options: [{ label: 'Active', value: 'active' }]
        },
        { type: COMPONENT_TYPE.button, label: 'Search' }
      ];

      render(<FilterContainer items={items} />);

      expect(screen.getByLabelText('IUV')).toBeInTheDocument();
      expect(screen.getByLabelText('IUD')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Search' })
      ).toBeInTheDocument();
    });
  });
});
