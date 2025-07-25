import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import {
  useGlobalPaymentSelection,
  UseGlobalPaymentSelectionParams
} from './useGlobalPaymentSelection';

describe('useGlobalPaymentSelection', () => {
  const mockSetValue = vi.fn();

  const sampleCurrentPageRows = [
    { uniqueId: 'iud1-0', iud: 'IUD1' },
    { uniqueId: 'iud2-0', iud: 'IUD2' },
    { uniqueId: 'iud1-1', iud: 'IUD1' },
    { uniqueId: 'iud3-0', iud: 'IUD3' }
  ];

  const defaultProps: UseGlobalPaymentSelectionParams = {
    setValue: mockSetValue,
    selectedPayments: [],
    currentPageRows: sampleCurrentPageRows
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty state when no selectedPayments provided', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      expect(result.current.globalSelectedUniqueIds.size).toBe(0);
      expect(result.current.totalSelected).toBe(0);
    });

    it('should initialize with selectedPayments when provided', () => {
      const propsWithSelection = {
        ...defaultProps,
        selectedPayments: ['IUD1', 'IUD2']
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithSelection)
      );

      expect(result.current.globalSelectedUniqueIds.size).toBe(3);
      expect(result.current.totalSelected).toBe(3);
      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud1-1')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud2-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud3-0')).toBe(false);
    });

    it('should handle empty currentPageRows', () => {
      const propsWithoutRows = {
        ...defaultProps,
        currentPageRows: []
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithoutRows)
      );

      expect(result.current.globalSelectedUniqueIds.size).toBe(0);
      expect(result.current.totalSelected).toBe(0);
    });

    it('should update global mapping when currentPageRows changes', () => {
      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: defaultProps }
      );

      const newCurrentPageRows = [
        { uniqueId: 'iud4-0', iud: 'IUD4' },
        { uniqueId: 'iud5-0', iud: 'IUD5' }
      ];

      const newProps = {
        ...defaultProps,
        currentPageRows: newCurrentPageRows
      };

      rerender(newProps);

      act(() => {
        result.current.toggleUniqueIdSelection(['iud4-0'], true);
      });

      expect(result.current.isUniqueIdSelected('iud4-0')).toBe(true);
    });
  });

  describe('toggleUniqueIdSelection', () => {
    it('should select uniqueIds when selected is true', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud2-0'], true);
      });

      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud2-0')).toBe(true);
      expect(result.current.totalSelected).toBe(2);
    });

    it('should deselect uniqueIds when selected is false', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(
          ['iud1-0', 'iud2-0', 'iud3-0'],
          true
        );
      });

      expect(result.current.totalSelected).toBe(3);

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud3-0'], false);
      });

      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(false);
      expect(result.current.isUniqueIdSelected('iud2-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud3-0')).toBe(false);
      expect(result.current.totalSelected).toBe(1);
    });

    it('should sync selections to form via setValue', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud2-0'], true);
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
            'IUD1',
            'IUD2'
          ]);
          resolve(undefined);
        }, 0);
      });
    });

    it('should handle multiple uniqueIds for same IUD correctly in form sync', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud1-1'], true);
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
            'IUD1'
          ]);
          resolve(undefined);
        }, 0);
      });
    });

    it('should handle empty uniqueIds array', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection([], true);
      });

      expect(result.current.totalSelected).toBe(0);
    });

    it('should sort the selectedPayments array when syncing to form', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(
          ['iud3-0', 'iud1-0', 'iud2-0'],
          true
        );
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
            'IUD1',
            'IUD2',
            'IUD3'
          ]);
          resolve(undefined);
        }, 0);
      });
    });
  });

  describe('clearAllSelections', () => {
    it('should clear all selections and reset state', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(
          ['iud1-0', 'iud2-0', 'iud3-0'],
          true
        );
      });

      expect(result.current.totalSelected).toBe(3);

      act(() => {
        result.current.clearAllSelections();
      });

      expect(result.current.globalSelectedUniqueIds.size).toBe(0);
      expect(result.current.totalSelected).toBe(0);
      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(false);
      expect(result.current.isUniqueIdSelected('iud2-0')).toBe(false);
      expect(result.current.isUniqueIdSelected('iud3-0')).toBe(false);
      expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', []);
    });

    it('should work when called on empty state', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.clearAllSelections();
      });

      expect(result.current.totalSelected).toBe(0);
      expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', []);
    });
  });

  describe('isUniqueIdSelected', () => {
    it('should return true for selected uniqueIds', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud2-0'], true);
      });

      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud2-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud3-0')).toBe(false);
    });

    it('should return false for non-existent uniqueIds', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      expect(result.current.isUniqueIdSelected('non-existent')).toBe(false);
    });
  });

  describe('isSelected (backward compatibility)', () => {
    it('should return true if any uniqueId with the IUD is selected', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0'], true);
      });

      expect(result.current.isSelected('IUD1')).toBe(true);
      expect(result.current.isSelected('IUD2')).toBe(false);
    });

    it('should return true if all uniqueIds with the IUD are selected', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud1-1'], true);
      });

      expect(result.current.isSelected('IUD1')).toBe(true);
    });

    it('should return false for non-existent IUDs', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      expect(result.current.isSelected('NON_EXISTENT_IUD')).toBe(false);
    });

    it('should handle empty currentPageRows', () => {
      const propsWithoutRows = {
        ...defaultProps,
        currentPageRows: []
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithoutRows)
      );

      expect(result.current.isSelected('IUD1')).toBe(false);
    });
  });

  describe('Cross-page functionality', () => {
    it('should maintain selections across page changes', () => {
      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: defaultProps }
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0', 'iud2-0'], true);
      });

      expect(result.current.totalSelected).toBe(2);

      const newPageRows = [
        { uniqueId: 'iud4-0', iud: 'IUD4' },
        { uniqueId: 'iud5-0', iud: 'IUD5' }
      ];

      const newProps = {
        ...defaultProps,
        currentPageRows: newPageRows
      };

      rerender(newProps);

      expect(result.current.totalSelected).toBe(2);
      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud2-0')).toBe(true);

      expect(result.current.isSelected('IUD1')).toBe(false);
      expect(result.current.isSelected('IUD4')).toBe(false);
    });

    it('should handle selections on new page with global mapping', () => {
      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: defaultProps }
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0'], true);
      });

      const newPageRows = [{ uniqueId: 'iud4-0', iud: 'IUD4' }];

      rerender({
        ...defaultProps,
        currentPageRows: newPageRows
      });

      act(() => {
        result.current.toggleUniqueIdSelection(['iud4-0'], true);
      });

      expect(result.current.totalSelected).toBe(2);
      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.isUniqueIdSelected('iud4-0')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined or null values gracefully', () => {
      const propsWithUndefined = {
        setValue: mockSetValue,
        selectedPayments: undefined,
        currentPageRows: undefined
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithUndefined)
      );

      expect(result.current.totalSelected).toBe(0);
      expect(result.current.isUniqueIdSelected('any')).toBe(false);
      expect(result.current.isSelected('any')).toBe(false);
    });

    it('should handle currentPageRows with missing properties', () => {
      const propsWithIncompleteRows = {
        ...defaultProps,
        currentPageRows: [
          { uniqueId: 'iud1-0', iud: 'IUD1' },
          { uniqueId: '', iud: 'IUD2' },
          { uniqueId: 'iud3-0', iud: '' },
          {} as any
        ]
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithIncompleteRows)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0'], true);
      });

      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.totalSelected).toBe(1);
    });

    it('should handle rapid consecutive toggles', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0'], true);
        result.current.toggleUniqueIdSelection(['iud1-0'], false);
        result.current.toggleUniqueIdSelection(['iud1-0'], true);
      });

      expect(result.current.isUniqueIdSelected('iud1-0')).toBe(true);
      expect(result.current.totalSelected).toBe(1);
    });

    it('should handle large number of selections', () => {
      const manyRows = Array.from({ length: 100 }, (_, i) => ({
        uniqueId: `iud${i}-0`,
        iud: `IUD${i}`
      }));

      const propsWithManyRows = {
        ...defaultProps,
        currentPageRows: manyRows
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithManyRows)
      );

      const allUniqueIds = manyRows.map((row) => row.uniqueId);

      act(() => {
        result.current.toggleUniqueIdSelection(allUniqueIds, true);
      });

      expect(result.current.totalSelected).toBe(100);

      act(() => {
        result.current.clearAllSelections();
      });

      expect(result.current.totalSelected).toBe(0);
    });
  });

  describe('Form synchronization', () => {
    it('should call setValue with sorted array of unique IUDs', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(
          ['iud3-0', 'iud1-0', 'iud1-1', 'iud2-0'],
          true
        );
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
            'IUD1',
            'IUD2',
            'IUD3'
          ]);
          resolve(undefined);
        }, 0);
      });
    });

    it('should handle partial deselection correctly', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleUniqueIdSelection(
          ['iud1-0', 'iud1-1', 'iud2-0'],
          true
        );
      });

      act(() => {
        result.current.toggleUniqueIdSelection(['iud1-0'], false);
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockSetValue).toHaveBeenLastCalledWith('selectedPayments', [
            'IUD1',
            'IUD2'
          ]);
          resolve(undefined);
        }, 0);
      });
    });
  });
});
