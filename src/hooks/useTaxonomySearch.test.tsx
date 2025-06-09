import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import useTaxonomySearch from './useTaxonomySearch';
import { useSearchParams } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn()
}));

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
    initialFilters: {},
    initialPage: 0,
    initialSize: 10
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTaxonomySearch(defaultProps));

    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(10);
    expect(result.current.filterValues).toEqual({});
  });

  it('should initialize with custom values', () => {
    const customProps = {
      initialFilters: { macroAreaCode: '14' },
      initialPage: 2,
      initialSize: 25
    };

    const { result } = renderHook(() => useTaxonomySearch(customProps));

    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(25);
    expect(result.current.filterValues).toEqual({ macroAreaCode: '14' });
  });

  it('should handle filter changes', () => {
    const { result } = renderHook(() => useTaxonomySearch(defaultProps));

    act(() => {
      result.current.handleFilterChange('macroAreaCode', 'collectionReason');
    });

    expect(result.current.filterValues.macroAreaCode).toBe('collectionReason');
  });

  it('should expose required functions', () => {
    const { result } = renderHook(() => useTaxonomySearch(defaultProps));

    expect(typeof result.current.applyFilters).toBe('function');
    expect(typeof result.current.handlePaginationChange).toBe('function');
    expect(typeof result.current.setFilterValues).toBe('function');
  });
});
