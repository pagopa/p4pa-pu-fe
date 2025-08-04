import { describe, it, expect } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import ChipTruncateTooltip from '.';

describe('ChipTruncateTooltip', () => {
  it('renders chip with label and tooltip', () => {
    const labelText = 'Test Label';

    render(<ChipTruncateTooltip label={labelText} color="primary" />);

    expect(screen.getByText(labelText)).toBeInTheDocument();
  });
});
