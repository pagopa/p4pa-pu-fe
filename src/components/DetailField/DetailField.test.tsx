import { describe, it, expect } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { DetailField, DetailFieldProps } from '../DetailField';

describe('DetailField', () => {
  const defaultProps: DetailFieldProps = {
    id: 'test-id',
    label: 'Test Label',
    value: 'Test Value',
    variant: 'monospaced'
  };

  it('renders the label and value correctly', () => {
    render(<DetailField {...defaultProps} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('handles missing variant by falling back to default', () => {
    render(<DetailField {...defaultProps} variant={undefined} />);

    const typography = screen.getByText('Test Value');
    expect(typography).toHaveClass('MuiTypography-monospaced');
  });

  it('applies the correct styles for word break and paragraph', () => {
    render(<DetailField {...defaultProps} />);

    const typography = screen.getByText('Test Value');
    expect(typography).toHaveStyle('word-break: break-word');
    expect(typography).toHaveClass('MuiTypography-paragraph');
  });
});
