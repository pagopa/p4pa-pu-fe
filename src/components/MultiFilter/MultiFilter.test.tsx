import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent} from '@testing-library/react';
import MultiFilter from './MultiFilter';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

describe('MultiFilter', () => {
  const defaultProps = {
    selectLabel: 'Select Option',
    inputLabel: { label: 'Input Value' },
    selectOptions: [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial empty filter row', () => {
    render(<MultiFilter {...defaultProps} />);
    
    expect(screen.getByLabelText('Select Option')).toBeDefined();
    expect(screen.getByLabelText('Input Value')).toBeDefined();
    expect(screen.getByLabelText('Input Value')).toHaveProperty('disabled', true);
  });

  it('adds new filter row when add button is clicked', () => {
    render(<MultiFilter {...defaultProps} />);
    
    const addButton = screen.getByText('commons.addfilter');
    fireEvent.click(addButton);
    
    expect(screen.getAllByLabelText('Select Option')).toHaveLength(2);
    expect(screen.getAllByLabelText('Input Value')).toHaveLength(2);
  });

  it('removes filter row when remove button is clicked', () => {
    render(<MultiFilter {...defaultProps} />);
    
    const addButton = screen.getByText('commons.addfilter');
    fireEvent.click(addButton);
    
    const removeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(removeButton);
    
    expect(screen.getAllByLabelText('Select Option')).toHaveLength(1);
    expect(screen.getAllByLabelText('Input Value')).toHaveLength(1);
  });

  it('cannot remove the first filter row', () => {
    render(<MultiFilter {...defaultProps} />);
    
    expect(screen.queryByRole('button', { name: '' })).toBeNull();
  });

  it('enables input when select has value', () => {
    render(<MultiFilter {...defaultProps} />);
    
    const selectButton = screen.getByLabelText('Select Option');
    
    fireEvent.mouseDown(selectButton);
    
    const options = screen.getAllByRole('option');
    fireEvent.click(options[0]);
    
    const input = screen.getByLabelText('Input Value');
    expect(input).toHaveProperty('disabled', false);
  });

  it('handles input changes correctly', () => {
    render(<MultiFilter {...defaultProps} />);
    
    const selectButton = screen.getByLabelText('Select Option');
    fireEvent.mouseDown(selectButton);
    const options = screen.getAllByRole('option');
    fireEvent.click(options[0]);
    
    const input = screen.getByLabelText('Input Value') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'test value' } });
    
    expect(input.value).toBe('test value');
  });

  it('renders with icon when provided', () => {
    const propsWithIcon = {
      ...defaultProps,
      inputLabel: {
        label: 'Input Value',
        icon: <span data-testid="test-icon">icon</span>,
      },
    };
    
    render(<MultiFilter {...propsWithIcon} />);
    
    expect(screen.getByTestId('test-icon')).toBeDefined();
  });

  it('maintains separate states for multiple filter rows', () => {
    render(<MultiFilter {...defaultProps} />);
    
    const addButton = screen.getByText('commons.addfilter');
    fireEvent.click(addButton);
    
    const selects = screen.getAllByLabelText('Select Option');
    
    fireEvent.mouseDown(selects[0]);
    const firstOptions = screen.getAllByRole('option');
    fireEvent.click(firstOptions[0]);
    
    const inputs = screen.getAllByLabelText('Input Value') as HTMLInputElement[];
    fireEvent.input(inputs[0], { target: { value: 'value 1' } });
 
    fireEvent.mouseDown(selects[1]);
    const secondOptions = screen.getAllByRole('option');
    fireEvent.click(secondOptions[1]);
    fireEvent.input(inputs[1], { target: { value: 'value 2' } });
    

    expect(inputs[0].value).toBe('value 1');
    expect(inputs[1].value).toBe('value 2');
  });
});
