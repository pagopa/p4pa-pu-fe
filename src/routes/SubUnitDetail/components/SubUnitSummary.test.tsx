import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SubUnitSummary } from './SubUnitSummary';

const formatDate = vi.fn((date: string, format: string) => `${date}|${format}`);
vi.mock('@core/utils/formatters', () => ({
  formatDate: (date: string, format: string) => formatDate(date, format)
}));

describe('SubUnitSummary', () => {
  it('renders the provided values, formatting the creation date', () => {
    render(
      <SubUnitSummary
        subUnitCode="SU1"
        subUnitType="AOO"
        subUnitName="Test Sub Unit"
        creationDate="2024-12-19"
      />
    );

    expect(screen.getByText('SU1')).toBeInTheDocument();
    expect(screen.getByText('AOO')).toBeInTheDocument();
    expect(screen.getByText('Test Sub Unit')).toBeInTheDocument();
    expect(formatDate).toHaveBeenCalledWith('2024-12-19', 'dd MMMM yyyy');
    expect(screen.getByText('2024-12-19|dd MMMM yyyy')).toBeInTheDocument();
  });

  it('falls back to the placeholder for missing values, without formatting an empty date', () => {
    render(<SubUnitSummary />);

    expect(screen.getAllByText('_')).toHaveLength(4);
    expect(formatDate).not.toHaveBeenCalled();
  });
});
