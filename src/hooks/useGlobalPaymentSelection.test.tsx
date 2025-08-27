import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import {
  useGlobalPaymentSelection,
  UseGlobalPaymentSelectionParams
} from './useGlobalPaymentSelection';

describe('useGlobalPaymentSelection', () => {
  const mockSetValue = vi.fn();

  const waitForAsyncOperation = (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, 0);
    });
  };

  const sampleCurrentPageRows = [
    { iud: 'IUD1' },
    { iud: 'IUD2' },
    { iud: 'IUD3' }
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

      expect(result.current.globalSelectedIuds.size).toBe(0);
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

      expect(result.current.globalSelectedIuds.size).toBe(2);
      expect(result.current.totalSelected).toBe(2);
      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.isIudSelected('IUD2')).toBe(true);
      expect(result.current.isIudSelected('IUD3')).toBe(false);
    });

    it('should handle empty currentPageRows', () => {
      const propsWithoutRows = {
        ...defaultProps,
        currentPageRows: []
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithoutRows)
      );

      expect(result.current.globalSelectedIuds.size).toBe(0);
      expect(result.current.totalSelected).toBe(0);
    });

    it('should handle currentPageRows changes', () => {
      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: defaultProps }
      );

      const newCurrentPageRows = [{ iud: 'IUD4' }, { iud: 'IUD5' }];

      const newProps = {
        ...defaultProps,
        currentPageRows: newCurrentPageRows
      };

      rerender(newProps);

      act(() => {
        result.current.toggleIudSelection(['IUD4'], true);
      });

      expect(result.current.isIudSelected('IUD4')).toBe(true);
    });
  });

  describe('toggleIudSelection', () => {
    it('should select IUDs when selected is true', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2'], true);
      });

      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.isIudSelected('IUD2')).toBe(true);
      expect(result.current.totalSelected).toBe(2);
    });

    it('should deselect IUDs when selected is false', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2', 'IUD3'], true);
      });

      expect(result.current.totalSelected).toBe(3);

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD3'], false);
      });

      expect(result.current.isIudSelected('IUD1')).toBe(false);
      expect(result.current.isIudSelected('IUD2')).toBe(true);
      expect(result.current.isIudSelected('IUD3')).toBe(false);
      expect(result.current.totalSelected).toBe(1);
    });

    it('should sync selections to form via setValue', async () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2'], true);
      });

      await waitForAsyncOperation();

      expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
        'IUD1',
        'IUD2'
      ]);
    });

    it('should handle empty IUDs array', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection([], true);
      });

      expect(result.current.totalSelected).toBe(0);
    });

    it('should sort the selectedPayments array when syncing to form', async () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD3', 'IUD1', 'IUD2'], true);
      });

      await waitForAsyncOperation();

      expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
        'IUD1',
        'IUD2',
        'IUD3'
      ]);
    });
  });

  describe('clearAllSelections', () => {
    it('should clear all selections and reset state', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2', 'IUD3'], true);
      });

      expect(result.current.totalSelected).toBe(3);

      act(() => {
        result.current.clearAllSelections();
      });

      expect(result.current.globalSelectedIuds.size).toBe(0);
      expect(result.current.totalSelected).toBe(0);
      expect(result.current.isIudSelected('IUD1')).toBe(false);
      expect(result.current.isIudSelected('IUD2')).toBe(false);
      expect(result.current.isIudSelected('IUD3')).toBe(false);
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

  describe('isIudSelected', () => {
    it('should return true for selected IUDs', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2'], true);
      });

      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.isIudSelected('IUD2')).toBe(true);
      expect(result.current.isIudSelected('IUD3')).toBe(false);
    });

    it('should return false for non-existent IUDs', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      expect(result.current.isIudSelected('NON_EXISTENT')).toBe(false);
    });
  });

  describe('isSelected (backward compatibility)', () => {
    it('should return true if the IUD is selected', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1'], true);
      });

      expect(result.current.isSelected('IUD1')).toBe(true);
      expect(result.current.isSelected('IUD2')).toBe(false);
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
        result.current.toggleIudSelection(['IUD1', 'IUD2'], true);
      });

      expect(result.current.totalSelected).toBe(2);

      const newPageRows = [{ iud: 'IUD4' }, { iud: 'IUD5' }];

      const newProps = {
        ...defaultProps,
        currentPageRows: newPageRows
      };

      rerender(newProps);

      expect(result.current.totalSelected).toBe(2);
      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.isIudSelected('IUD2')).toBe(true);
      expect(result.current.isSelected('IUD1')).toBe(true);
      expect(result.current.isSelected('IUD4')).toBe(false);
    });

    it('should handle selections on new page', () => {
      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: defaultProps }
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1'], true);
      });

      const newPageRows = [{ iud: 'IUD4' }];

      rerender({
        ...defaultProps,
        currentPageRows: newPageRows
      });

      act(() => {
        result.current.toggleIudSelection(['IUD4'], true);
      });

      expect(result.current.totalSelected).toBe(2);
      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.isIudSelected('IUD4')).toBe(true);
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
      expect(result.current.isIudSelected('any')).toBe(false);
      expect(result.current.isSelected('any')).toBe(false);
    });

    it('should handle currentPageRows with missing properties', () => {
      const propsWithIncompleteRows = {
        ...defaultProps,
        currentPageRows: [
          { iud: 'IUD1' },
          { iud: 'IUD2' },
          { iud: '' }
        ] as Array<{ iud: string; assessmentDetailId?: number }>
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithIncompleteRows)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1'], true);
      });

      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.totalSelected).toBe(1);
    });

    it('should handle rapid consecutive toggles', () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1'], true);
        result.current.toggleIudSelection(['IUD1'], false);
        result.current.toggleIudSelection(['IUD1'], true);
      });

      expect(result.current.isIudSelected('IUD1')).toBe(true);
      expect(result.current.totalSelected).toBe(1);
    });

    it('should handle large number of selections', () => {
      const manyRows = Array.from({ length: 100 }, (_, i) => ({
        iud: `IUD${i}`
      }));

      const propsWithManyRows = {
        ...defaultProps,
        currentPageRows: manyRows
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(propsWithManyRows)
      );

      const allIuds = manyRows.map((row) => row.iud);

      act(() => {
        result.current.toggleIudSelection(allIuds, true);
      });

      expect(result.current.totalSelected).toBe(100);

      act(() => {
        result.current.clearAllSelections();
      });

      expect(result.current.totalSelected).toBe(0);
    });
  });

  describe('Remove mode functionality', () => {
    it('should handle isRemoveMode with assessmentDetailId mapping', () => {
      const currentPageRowsWithAssessmentDetailId = [
        { iud: 'IUD1', assessmentDetailId: 101 },
        { iud: 'IUD2', assessmentDetailId: 102 },
        { iud: 'IUD3', assessmentDetailId: 103 }
      ];

      const removeModeProps: UseGlobalPaymentSelectionParams = {
        setValue: mockSetValue,
        selectedPayments: [],
        currentPageRows: currentPageRowsWithAssessmentDetailId,
        isRemoveMode: true
      };

      const { result } = renderHook(() =>
        useGlobalPaymentSelection(removeModeProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2'], true);
      });

      expect(result.current.totalSelected).toBe(2);
    });

    it('should handle cross-page IUD selection correctly', async () => {
      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: defaultProps }
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1'], true);
      });

      const newPageRows = [{ iud: 'IUD1' }, { iud: 'IUD4' }];

      rerender({
        ...defaultProps,
        currentPageRows: newPageRows
      });

      act(() => {
        result.current.toggleIudSelection(['IUD4'], true);
      });

      await waitForAsyncOperation();

      expect(result.current.totalSelected).toBe(2);
      expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
        'IUD1',
        'IUD4'
      ]);
    });

    it('should handle assessmentDetailId mapping in remove mode', async () => {
      const currentPageRowsWithAssessmentDetailId = [
        { iud: 'IUD1', assessmentDetailId: 101 },
        { iud: 'IUD2', assessmentDetailId: 102 }
      ];

      const removeModeProps: UseGlobalPaymentSelectionParams = {
        setValue: mockSetValue,
        selectedPayments: [],
        currentPageRows: currentPageRowsWithAssessmentDetailId,
        isRemoveMode: true
      };

      const { result, rerender } = renderHook(
        (props) => useGlobalPaymentSelection(props),
        { initialProps: removeModeProps }
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1'], true);
      });

      const newPageRows = [
        { iud: 'IUD1', assessmentDetailId: 101 },
        { iud: 'IUD3', assessmentDetailId: 103 }
      ];

      rerender({
        ...removeModeProps,
        currentPageRows: newPageRows
      });

      act(() => {
        result.current.toggleIudSelection(['IUD3'], true);
      });

      await waitForAsyncOperation();

      expect(result.current.totalSelected).toBe(2);
      expect(mockSetValue).toHaveBeenCalledWith(
        'selectedAssessmentDetailIds',
        [101, 103]
      );
    });
  });

  describe('Form synchronization', () => {
    it('should call setValue with sorted array of unique IUDs', async () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD3', 'IUD1', 'IUD2'], true);
      });

      await waitForAsyncOperation();

      expect(mockSetValue).toHaveBeenCalledWith('selectedPayments', [
        'IUD1',
        'IUD2',
        'IUD3'
      ]);
    });

    it('should handle partial deselection correctly', async () => {
      const { result } = renderHook(() =>
        useGlobalPaymentSelection(defaultProps)
      );

      act(() => {
        result.current.toggleIudSelection(['IUD1', 'IUD2'], true);
      });

      act(() => {
        result.current.toggleIudSelection(['IUD1'], false);
      });

      await waitForAsyncOperation();

      expect(mockSetValue).toHaveBeenLastCalledWith('selectedPayments', [
        'IUD2'
      ]);
    });
  });
});
