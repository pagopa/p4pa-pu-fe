import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import ChipTruncateTooltip from '.';

describe('ChipTruncateTooltip', () => {
  it('renders chip with label and tooltip', () => {
    const labelText = 'Test Label';

    render(<ChipTruncateTooltip label={labelText} color="primary" />);

    expect(screen.getByText(labelText)).toBeInTheDocument();
  });

  it('shows custom tooltip when tooltipLabel is provided', async () => {
    const labelText = 'Status';
    const tooltipText = 'Custom tooltip message';

    render(
      <ChipTruncateTooltip
        label={labelText}
        tooltipLabel={tooltipText}
        color="primary"
      />
    );

    const chip = screen.getByText(labelText);
    expect(chip).toBeInTheDocument();

    // Hover to show tooltip
    fireEvent.mouseOver(chip);

    // Wait for tooltip to appear
    expect(await screen.findByRole('tooltip')).toHaveTextContent(tooltipText);
  });

  it('falls back to label as tooltip when tooltipLabel is not provided', async () => {
    const labelText = 'Test Label';

    render(<ChipTruncateTooltip label={labelText} color="primary" />);

    const chip = screen.getByText(labelText);
    fireEvent.mouseOver(chip);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(labelText);
  });
});
