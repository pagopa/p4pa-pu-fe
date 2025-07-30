import { renderHook, act } from '@testing-library/react';
import { usePaymentSelection } from '../usePaymentSelection';

describe('usePaymentSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => usePaymentSelection());

    expect(result.current.selectedPayments).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.hasSelections).toBe(false);
  });

  it('should initialize with provided selections', () => {
    const { result } = renderHook(() =>
      usePaymentSelection({ initialSelected: ['payment1', 'payment2'] })
    );

    expect(result.current.selectedPayments).toEqual(['payment1', 'payment2']);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.hasSelections).toBe(true);
  });

  it('should toggle selection correctly', () => {
    const { result } = renderHook(() => usePaymentSelection());

    // Seleziona payment1
    act(() => {
      result.current.toggleSelection(['payment1']);
    });

    expect(result.current.selectedPayments).toEqual(['payment1']);
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected('payment1')).toBe(true);

    // Deseleziona payment1
    act(() => {
      result.current.toggleSelection(['payment1']);
    });

    expect(result.current.selectedPayments).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('payment1')).toBe(false);
  });

  it('should handle multiple selections', () => {
    const { result } = renderHook(() => usePaymentSelection());

    act(() => {
      result.current.toggleSelection(['payment1', 'payment2', 'payment3']);
    });

    expect(result.current.selectedPayments).toEqual([
      'payment1',
      'payment2',
      'payment3'
    ]);
    expect(result.current.selectedCount).toBe(3);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() =>
      usePaymentSelection({ initialSelected: ['payment1', 'payment2'] })
    );

    expect(result.current.selectedCount).toBe(2);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedPayments).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.hasSelections).toBe(false);
  });

  it('should sort selected payments consistently', () => {
    const { result } = renderHook(() => usePaymentSelection());

    act(() => {
      result.current.toggleSelection(['payment3', 'payment1', 'payment2']);
    });

    // Deve essere sorted alfabeticamente
    expect(result.current.selectedPayments).toEqual([
      'payment1',
      'payment2',
      'payment3'
    ]);
  });

  it('should check selection status correctly', () => {
    const { result } = renderHook(() => usePaymentSelection());

    act(() => {
      result.current.toggleSelection(['payment1', 'payment2']);
    });

    expect(result.current.isSelected('payment1')).toBe(true);
    expect(result.current.isSelected('payment2')).toBe(true);
    expect(result.current.isSelected('payment3')).toBe(false);
  });
});
