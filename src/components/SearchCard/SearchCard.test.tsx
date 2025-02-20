import { describe, it, expect } from 'vitest';
import SearchCard from './SearchCard';
import { vi } from 'vitest';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { fireEvent, render, screen } from '../../__tests__/renderers';

describe('SearchCard', () => {
  const defaultProps = {
    title: 'Search Title',
    description: 'Search Description',
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: 'Search Field',
        placeholder: 'Type something...'
      }
    ],
    button: [
      {
        text: 'Search',
        variant: 'contained' as const,
        onClick: vi.fn()
      }
    ],
    multiFilterConfig: {
      searchTest: {
        label: 'Test Search',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'Test Field'
          }
        ]
      }
    }
  };

  it('renders title and description', () => {
    render(<SearchCard {...defaultProps} />);

    expect(screen.getByText('Search Title')).toBeInTheDocument();
    expect(screen.getByText('Search Description')).toBeInTheDocument();
  });

  it('renders input field correctly', () => {
    render(<SearchCard {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type something...');
    expect(input).toBeInTheDocument();
  });

  it('renders select field with options', () => {
    render(<SearchCard {...defaultProps} />);

    const select = screen.getByLabelText('commons.searchFor');
    expect(select).toBeInTheDocument();
  });

  it('renders button and handles click', () => {
    render(<SearchCard {...defaultProps} />);

    const button = screen.getByRole('button', { name: '' });
    expect(button).toHaveAttribute('text', 'Search');

    fireEvent.click(button);
    expect(defaultProps.button[0].onClick).toHaveBeenCalled();
  });

  it('renders MultiFilter when enabled', () => {
    render(<SearchCard {...defaultProps} />);

    expect(screen.getByLabelText('commons.searchFor')).toBeInTheDocument();
  });

  it('does not render MultiFilter when disabled', () => {
    const propsWithoutFilter = {
      ...defaultProps,
      multiFilterConfig: undefined
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

    expect(screen.getByText('Minimal Title')).toBeInTheDocument();
    expect(screen.getByText('Minimal Description')).toBeInTheDocument();
  });
});
