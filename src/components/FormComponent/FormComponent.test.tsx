import { describe, expect, it } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { FormComponent } from '../FormComponent';

describe('TextField Component', () => {
  it('renders with default search icon', () => {
    render(<FormComponent.TextField id="test-input" label="Test Label" />);
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('SearchRoundedIcon')).toBeInTheDocument();
  });

  it('renders with custom icon when provided', () => {
    const CustomIcon = () => <span data-testid="custom-icon">*</span>;
    render(<FormComponent.TextField id="test-input" label="With Icon" icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders with provided placeholder', () => {
    render(
      <FormComponent.TextField id="test-input" label="With Placeholder" placeholder="Enter text" />
    );
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });
});

describe('AmountField Component', () => {
  it('renders with default Euro icon', () => {
    render(<FormComponent.AmountField id="test-input" label="Test Label" />);
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByTestId('EuroRoundedIcon')).toBeInTheDocument();
  });
});
