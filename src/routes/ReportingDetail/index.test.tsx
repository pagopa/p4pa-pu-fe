import { describe, it, vi } from 'vitest';
import ReportingDetail from '.';
import { render } from '../../__tests__/renderers';
import React from 'react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    generatePath: actual.generatePath,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});

describe('Reporting Detail Page', () => {
  it('renders Reporting Detail without crashing', () => {
    render(<ReportingDetail />);
  });
});
