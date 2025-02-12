import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchCard from './SearchCard';
import { vi } from 'vitest';
import { COMPONENT_TYPE, FilterItem } from '../FilterContainer/FilterContainer';

describe('SearchCard', () => {
  const mockProps = {
    title: 'Search Title',
    description: 'Search Description',
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: 'Search Input',
        placeholder: 'Type something...',
        gridWidth: 6
      },
      {
        type: COMPONENT_TYPE.select,
        label: 'Select Option',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ],
        gridWidth: 6
      }
    ] as FilterItem[],
    button: [
      {
        text: 'Search',
        variant: 'contained' as const,
        onClick: vi.fn()
      }
    ],
    multiFilterConfig: {
      enabled: true,
      selectLabel: 'Filter By',
      inputLabel: {
        label: 'Filter Input'
      },
      selectOptions: [
        { label: 'Filter 1', value: 'f1' },
        { label: 'Filter 2', value: 'f2' }
      ]
    }
  };

  it('renders title and description', () => {
    render(<SearchCard {...mockProps} />);

    const title = screen.getByText('Search Title');
    const description = screen.getByText('Search Description');

    expect(title).toBeDefined();
    expect(description).toBeDefined();
  });

  it('renders input field correctly', () => {
    render(<SearchCard {...mockProps} />);

    const input = screen.getByPlaceholderText('Type something...');
    expect(input).toBeDefined();
  });

  it('renders select field with options', () => {
    render(<SearchCard {...mockProps} />);

    const select = screen.getByLabelText('Select Option');
    expect(select).toBeDefined();

    fireEvent.mouseDown(select);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0].textContent).toBe('Option 1');
    expect(options[1].textContent).toBe('Option 2');
  });


  it('renders button and handles click', () => {
    render(<SearchCard {...mockProps} />);

    const button = screen.getByRole('button', { name: 'Search' });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(mockProps.button[0].onClick).toHaveBeenCalled();
  });

  it('renders MultiFilter when enabled', () => {
    render(<SearchCard {...mockProps} />);

    const filterSelect = screen.getByRole('combobox', { name: /Filter By/i });
    const filterInput = screen.getByRole('textbox', { name: /Filter Input/i });

    expect(filterSelect).toBeDefined();
    expect(filterInput).toBeDefined();
  });

  it('does not render MultiFilter when disabled', () => {
    const propsWithoutFilter = {
      ...mockProps,
      multiFilterConfig: {
        ...mockProps.multiFilterConfig,
        enabled: false
      }
    };

    render(<SearchCard {...propsWithoutFilter} />);

    const filterSelect = screen.queryByRole('combobox', { name: /Filter By/i });
    const filterInput = screen.queryByRole('textbox', { name: /Filter Input/i });

    expect(filterSelect).toBeNull();
    expect(filterInput).toBeNull();
  });

  it('renders with minimal props', () => {
    const minimalProps = {
      title: 'Minimal Title',
      description: 'Minimal Description'
    };

    render(<SearchCard {...minimalProps} />);

    const title = screen.getByText('Minimal Title');
    const description = screen.getByText('Minimal Description');

    expect(title).toBeDefined();
    expect(description).toBeDefined();
  });
});
