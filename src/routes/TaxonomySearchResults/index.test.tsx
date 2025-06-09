import { describe, it, vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import TaxonomySearchResults from '.';
import React from 'react';

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});

describe('TaxonomySearchResults Page', () => {
  it('renders TaxonomyPage without crashing', () => {
    render(<TaxonomySearchResults />);
  });
});
