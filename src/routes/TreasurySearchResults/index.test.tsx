import { describe, it, vi } from 'vitest';
import TreasurySearchResults from '.';
import { render } from '../../__tests__/renderers';
import React from 'react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});

describe('TreasurySearchResults Page', () => {
  it('renders TreasurySearchResults view without crashing', () => {
    render(<TreasurySearchResults />);
  });
});
