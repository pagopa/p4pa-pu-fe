import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import Reporting from './Reporting';
import { useNavigate, generatePath } from 'react-router-dom';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('Reporting', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (generatePath as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );
  });

  it('renders the title and description', () => {
    render(<Reporting />);

    expect(screen.getByText('reporting.title')).toBeInTheDocument();
    expect(screen.getByText('reporting.description')).toBeInTheDocument();
  });

  it('renders the SearchCard with filterContext="REPORTING"', () => {
    render(<Reporting />);

    expect(
      screen.getByText('reporting.searchTitleContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByText('reporting.searchDescriptionContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.filters.filterResults' })
    ).toBeInTheDocument();
  });
});
