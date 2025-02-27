import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../__tests__/renderers';

import { vi } from 'vitest';
import { DebtPositionSearchResults } from './DebtPositionSearchResults';

vi.spyOn(console, 'log').mockImplementation(() => {});

describe('DebtPositionSearchResults Component', () => {
  it('renders title and call to action button', () => {
    render(<DebtPositionSearchResults />);
    expect(screen.getByText('DebtPositions.Results.titleIUV')).toBeInTheDocument();
    expect(screen.getByText('commons.createNew')).toBeInTheDocument();
  });

  it('triggers create button click', async () => {
    render(<DebtPositionSearchResults />);
    await userEvent.click(screen.getByText('commons.createNew'));
    expect(console.log).toHaveBeenCalledWith('create button clicked');
  });

  it('renders all filter fields', () => {
    render(<DebtPositionSearchResults />);
    expect(screen.getByLabelText('commons.searchCF')).toBeInTheDocument();
    expect(screen.getByLabelText('dates.to')).toBeInTheDocument();
    expect(screen.getByLabelText('commons.duetype')).toBeInTheDocument();
    expect(screen.getByLabelText('commons.state')).toBeInTheDocument();
    expect(screen.getByText('commons.filters.filterResults')).toBeInTheDocument();
  });

  it('applies filter on button click', async () => {
    render(<DebtPositionSearchResults />);
    await userEvent.click(screen.getByText('commons.filters.filterResults'));
    expect(console.log).toHaveBeenCalledWith('Filter applied');
  });

  it('renders the results table', () => {
    render(<DebtPositionSearchResults />);
    expect(screen.getByLabelText('results-table')).toBeInTheDocument();
  });
});
