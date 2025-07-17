import { describe, it, vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import TaxonomySearchResults from '.';
import React from 'react';

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    useLocation: vi.fn(() => ({ state: { filters: {} } })),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});

vi.mock('../../api/taxonomy', () => ({
  getTaxonomies: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: {
      content: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      number: 0
    },
    isLoading: false,
    isPending: false,
    error: null
  }))
}));

vi.mock('../../components/TaxonomyFilter', () => ({
  TaxonomyFilter: () => <div data-testid="taxonomy-filter">Taxonomy Filter</div>
}));

vi.mock('./TaxonomyDataGrid', () => ({
  default: () => <div data-testid="taxonomy-data-grid">Taxonomy Data Grid</div>
}));

describe('TaxonomySearchResults Page', () => {
  it('renders TaxonomyPage without crashing', () => {
    render(<TaxonomySearchResults />);
  });
});
