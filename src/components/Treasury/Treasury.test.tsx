import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../__tests__/renderers';
import Treasury from './Treasury';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: () => ({
    filterMap: {},
    removeAllFilters: vi.fn(),
    noFilterIsSelected: { peek: vi.fn(() => false) }
  }),
  FilterCategory: {
    TREASURY: 'TREASURY'
  }
}));

describe('Treasury', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
  });

  it('renders all sections and buttons', () => {
    render(<Treasury />);

    expect(screen.getByText('commons.routes.TREASURY')).toBeDefined();
    expect(screen.getByText('treasury.description')).toBeDefined();
    expect(screen.getByText('treasury.search')).toBeDefined();
    expect(screen.getByText('treasury.searchdescription')).toBeDefined();
    expect(screen.getByText('treasury.importflowstitle')).toBeDefined();
    expect(screen.getByText('treasury.importflowsdescription')).toBeDefined();
    expect(screen.getByText('commons.importFlow')).toBeDefined();
    expect(screen.getByText('commons.showAllFlows')).toBeDefined();
  });
});
