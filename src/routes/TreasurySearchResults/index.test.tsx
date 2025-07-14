import { describe, it, vi } from 'vitest';
import TreasurySearchResults from '.';
import { render } from '../../__tests__/renderers';
import React from 'react';

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: {
      organizationId: 123,
      filterValues: {},
      selectedFilters: []
    }
  })),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../api/treasuries', () => ({
  getTreasuries: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: null,
    isLoading: false,
    isPending: false,
    error: null
  }))
}));

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: vi.fn(() => ({
    filterMap: {},
    selectedFilters: [],
    removeAllFilters: vi.fn(),
    noFilterIsSelected: { peek: vi.fn(() => true) },
    filterValues: {}
  })),
  FilterCategory: {
    TREASURY: 'TREASURY',
    CLASSIFICATIONS: 'CLASSIFICATIONS',
    ASSESSMENT: 'ASSESSMENT'
  }
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: null,
      isLoading: false,
      error: null
    },
    applyFilters: vi.fn(),
    setSort: vi.fn(),
    handlePaginationChange: vi.fn()
  }))
}));

describe('TreasurySearchResults Page', () => {
  it('renders TreasurySearchResults view without crashing', () => {
    render(<TreasurySearchResults />);
  });
});
