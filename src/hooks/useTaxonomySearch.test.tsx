import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useTaxonomySearch from './useTaxonomySearch';
import { useSearchParams } from 'react-router';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useSearchParams: vi.fn()
  };
});

vi.mock('../api/taxonomy', () => ({
  getTaxonomies: vi.fn(() => ({
    mutate: vi.fn(),
    data: null,
    isLoading: false,
    error: null
  }))
}));

describe('useTaxonomySearch', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  const defaultProps = {
    filterValues: {
      orgType: '01'
    },
    initialPage: 0,
    initialSize: 10
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTaxonomySearch(defaultProps));

    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(10);
    expect(result.current.filterValues).toEqual({
      orgType: '01'
    });
  });

  it('should initialize with custom values', () => {
    const customProps = {
      filterValues: {
        orgType: '01',
        macroAreaCode: '14'
      },
      initialPage: 2,
      initialSize: 25
    };

    const { result } = renderHook(() => useTaxonomySearch(customProps));

    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(25);
    expect(result.current.filterValues).toEqual({
      orgType: '01',
      macroAreaCode: '14'
    });
  });
});
