import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { TelematicReceipt } from './TelematicReceipt';
import { useNavigate, generatePath } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('TelematicReceipt', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (generatePath as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );
  });

  it('renders the title and description', () => {
    render(<TelematicReceipt />);

    expect(
      screen.getByText('commons.routes.TELEMATIC_RECEIPT')
    ).toBeInTheDocument();
    expect(
      screen.getByText('telematicReceipts.description')
    ).toBeInTheDocument();
  });

  it('renders the SearchCard with filterContext="TELEMATIC"', () => {
    render(<TelematicReceipt />);

    expect(screen.getByText('telematicReceipts.search')).toBeInTheDocument();
    expect(
      screen.getByText('telematicReceipts.searchdescription')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.filters.filterResults' })
    ).toBeInTheDocument();
  });
});
