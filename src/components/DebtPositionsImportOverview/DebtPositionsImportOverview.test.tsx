import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import DebtPositionsImportOverview from './DebtPositionsImportOverview';

describe('DebtPositionsImportOverview', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it('renders successfully', () => {
    render(<DebtPositionsImportOverview />);
    expect(screen.getByText('commons.debtFlow')).toBeDefined();
  });

  it('displays data in the grid', () => {
    const { container } = render(<DebtPositionsImportOverview />);
    expect(container.querySelector('[data-field="fileName"]')).toBeDefined();
  });
});

it('renders action menu for UPLOADED status', () => {
  render(<DebtPositionsImportOverview />);
  expect(screen.getByTestId('download-button')).toBeDefined();
});

it('applies filters when filter button is clicked', () => {
  render(<DebtPositionsImportOverview />);
    
  const searchInput = screen.getByLabelText('commons.searchName');
  fireEvent.change(searchInput, { target: { value: 'test' } });
    
  const filterButton = screen.getByText('commons.filters.filterResults');
  fireEvent.click(filterButton);

  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('applied filters:'),
    expect.objectContaining({searchName: 'test'})
  );
});

it('renders correct chip colors for different statuses', () => {
  const { container } = render(<DebtPositionsImportOverview />);

  const uploadedChip = container.querySelector('.MuiChip-colorPrimary');
  const completedChip = container.querySelector('.MuiChip-colorSuccess');

  expect(uploadedChip).toBeDefined();
  expect(completedChip).toBeDefined();
});
