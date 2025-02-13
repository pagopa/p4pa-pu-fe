import { describe, it, vi } from 'vitest';
import ReportingDetail from '.';
import { render } from '../../__tests__/renderers';
import React from 'react';

vi.mock('react-router-dom', (importOriginal) => {
  const actual = importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});

describe('Reporting Detail Page', () => {
  it('renders Reporting Detail without crashing', () => {
    render(<ReportingDetail />);
  });
});
