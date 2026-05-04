import { render, screen } from '@testing-library/react';
import { Timeline } from '../Timeline';

describe('TimelineElement', () => {
  it('renders without crashing', () => {
    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
      />
    );
    expect(screen.getByTestId('element')).toBeInTheDocument();
  });

  it('renders the formatted date correctly', () => {
    const date = new Date(2025, 2, 24); // March 24, 2025
    render(
      <Timeline.Element
        date={date}
        element={<div data-testid="element">Test</div>}
      />
    );

    expect(screen.getByText('MAR')).toBeInTheDocument(); // Month
    expect(screen.getByText('24')).toBeInTheDocument(); // Day
    expect(screen.getByText('00:00')).toBeInTheDocument(); // Time (it'll be midnight as we're using 00:00)
  });

  it('renders the passed element content', () => {
    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
      />
    );
    expect(screen.getByTestId('element')).toHaveTextContent('Test');
  });

  it('does not render the connector if "last" is true', () => {
    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
        last={true}
      />
    );
    const connector = screen.queryByRole('separator');
    expect(connector).toBeNull(); // No connector should be rendered
  });

  it('renders status chip when provided', () => {
    const statusChip = {
      label: 'Success',
      color: 'success' as const
    };

    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
        statusChip={statusChip}
      />
    );

    const chip = screen.getByText('Success');
    expect(chip).toBeInTheDocument();
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
  });

  it('renders status chip with custom variant', () => {
    const statusChip = {
      label: 'Error',
      color: 'error' as const,
      variant: 'outlined' as const
    };

    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
        statusChip={statusChip}
      />
    );

    const chip = screen.getByText('Error');
    expect(chip).toBeInTheDocument();
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-outlined');
  });

  it('uses default filled variant when variant is not specified', () => {
    const statusChip = {
      label: 'Info',
      color: 'info' as const
    };

    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
        statusChip={statusChip}
      />
    );

    const chip = screen.getByText('Info');
    expect(chip).toBeInTheDocument();
    expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-filled');
  });

  it('does not render status chip when not provided', () => {
    render(
      <Timeline.Element
        date={new Date()}
        element={<div data-testid="element">Test</div>}
      />
    );

    const chip = screen.queryByRole('button');
    expect(chip).toBeNull();
  });
});
