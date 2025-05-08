import { GridSortModel } from '@mui/x-data-grid';
import { renderHook, act } from '../__tests__/renderers';
import useDebtTypesCreatedFilters from '../hooks/useDebtTypesCreatedFilters';

describe('useDebtTypesCreatedFilters', () => {
  it('should initialize with default filters if no initialFilters provided', () => {
    const { result } = renderHook(() => useDebtTypesCreatedFilters());

    expect(result.current.draftFilters).toEqual({
      page: 0,
      size: 10
    });
    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10
    });
  });

  it('should initialize with provided initialFilters', () => {
    const initialFilters = {
      code: 'TEST123',
      description: 'Test Description'
    };

    const { result } = renderHook(() =>
      useDebtTypesCreatedFilters({ initialFilters })
    );

    expect(result.current.draftFilters).toEqual({
      page: 0,
      size: 10,
      code: 'TEST123',
      description: 'Test Description'
    });
  });

  it('should update draft filters correctly', () => {
    const { result } = renderHook(() => useDebtTypesCreatedFilters());

    act(() => {
      result.current.updateDraftFilters({ code: 'UPDATED' });
    });

    expect(result.current.draftFilters).toEqual({
      page: 0,
      size: 10,
      code: 'UPDATED'
    });

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10
    });
  });

  it('should apply filters and reset page to 0', () => {
    const { result } = renderHook(() => useDebtTypesCreatedFilters());

    act(() => {
      result.current.updateDraftFilters({ code: 'FILTER', size: 20 });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 20,
      code: 'FILTER'
    });
  });

  it('should update pagination correctly', () => {
    const { result } = renderHook(() =>
      useDebtTypesCreatedFilters({ initialFilters: { code: 'TEST' } })
    );

    act(() => {
      result.current.updateDraftFilters({ code: 'TEST' });
      result.current.applyFilters();
    });

    act(() => {
      result.current.updatePagination({ page: 2, size: 15 });
    });

    expect(result.current.appliedFilters).toEqual({
      page: 2,
      size: 15,
      code: 'TEST'
    });
    expect(result.current.draftFilters).toEqual({
      page: 2,
      size: 15,
      code: 'TEST'
    });
  });

  it('should handle sort model changes', () => {
    const { result } = renderHook(() => useDebtTypesCreatedFilters());

    const sortModel: GridSortModel = [{ field: 'code', sort: 'asc' }];

    act(() => {
      result.current.handleSortModelChange(sortModel);
    });

    expect(result.current.sortModel).toEqual(sortModel);
    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10,
      sort: ['code,asc']
    });
  });

  it('should reset filters to initial state', () => {
    const { result } = renderHook(() =>
      useDebtTypesCreatedFilters({
        initialFilters: { code: 'INITIAL' }
      })
    );

    act(() => {
      result.current.updateDraftFilters({ description: 'Something' });
      result.current.applyFilters();
      result.current.handleSortModelChange([{ field: 'code', sort: 'desc' }]);
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.draftFilters).toEqual({
      page: 0,
      size: 10,
      code: 'INITIAL'
    });
    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10,
      code: 'INITIAL'
    });
    expect(result.current.sortModel).toEqual([]);
  });

  it('should correctly identify when a filter is active', () => {
    const { result } = renderHook(() => useDebtTypesCreatedFilters());

    expect(result.current.isFilterActive()).toBe(false);

    act(() => {
      result.current.updateDraftFilters({ page: 2, size: 20 });
    });

    expect(result.current.isFilterActive()).toBe(false);

    act(() => {
      result.current.updateDraftFilters({ code: 'ACTIVE' });
    });

    expect(result.current.isFilterActive()).toBe(true);
  });

  it('should remove empty params when cleaning filters', () => {
    const { result } = renderHook(() => useDebtTypesCreatedFilters());

    act(() => {
      result.current.updateDraftFilters({
        code: 'CODE',
        description: '',
        emptyArray: []
      });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10,
      code: 'CODE'
    });
  });
});
