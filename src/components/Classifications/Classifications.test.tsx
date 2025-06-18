import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { Classifications } from './Classifications';
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
    noFilterSelectedExcludingClassificationType: {
      peek: vi.fn(() => true)
    }
  }),
  FilterCategory: {
    CLASSIFICATIONS: 'CLASSIFICATIONS'
  }
}));

describe('Classifications', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
  });

  it('renders all sections and buttons', () => {
    render(<Classifications />);

    expect(screen.getByText('commons.routes.CLASSIFICATIONS')).toBeDefined();
    expect(screen.getByText('classifications.search')).toBeDefined();
    expect(screen.getByText('classifications.searchdescription')).toBeDefined();
    expect(screen.getByText('classifications.exportTitle')).toBeDefined();
    expect(screen.getByText('classifications.exportDescription')).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'commons.search' })
    ).toBeDefined();
  });
});
