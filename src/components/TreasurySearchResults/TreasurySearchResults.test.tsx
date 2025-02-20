import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import TreasurySearchResults from './TreasurySearchResults';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

vi.mock('../Drawer/CustomDrawer', () => ({
  default: ({ open, onClose }: {open: boolean, onClose: () => void}) => (
    <div data-testid="custom-drawer" style={{ display: open ? 'block' : 'none' }}>
      Drawer Content
      <button onClick={onClose} data-testid="close-drawer">Close</button>
    </div>
  )
}));

vi.mock('./SearchResultsDataGrid', () => ({
  default: () => <div data-testid="search-results-grid" />
}));

describe('TreasurySearchResults Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with title and description', () => {
    render(<TreasurySearchResults />);
    expect(screen.getByText('commons.routes.TREASURY')).toBeDefined();
    expect(screen.getByText('treasurySearchResults.description')).toBeDefined();
  });

  it('renders the search results table', () => {
    render(<TreasurySearchResults />);
    expect(screen.getByTestId('search-results-grid')).toBeDefined();
  });

  it('opens and closes the drawer when clicking the filter button', () => {
    render(<TreasurySearchResults />);

    const filterButton = screen.getByText('commons.filters.filtersField');
    expect(filterButton).toBeDefined();

    expect(screen.getByTestId('custom-drawer')).toHaveStyle('display: none');

    fireEvent.click(filterButton);
    expect(screen.getByTestId('custom-drawer')).toHaveStyle('display: block');

    fireEvent.click(screen.getByTestId('close-drawer'));
    expect(screen.getByTestId('custom-drawer')).toHaveStyle('display: none');
  });
});
