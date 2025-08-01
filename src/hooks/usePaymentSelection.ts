import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for simplified selection state management
 * Maintains compatibility with existing logic
 */

export type UsePaymentSelectionParams = {
  initialSelected?: Array<string>;
};

export type UsePaymentSelectionResult = {
  selectedPayments: Array<string>;
  selectedCount: number;
  toggleSelection: (paymentIds: Array<string>) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  hasSelections: boolean;
};

export const usePaymentSelection = ({
  initialSelected = []
}: UsePaymentSelectionParams = {}): UsePaymentSelectionResult => {
  const [selectedSet, setSelectedSet] = useState<Set<string>>(
    new Set(initialSelected)
  );

  /**
   * Toggle selection for one or more payment IDs
   * Supports both single and multiple selection
   */
  const toggleSelection = useCallback((paymentIds: Array<string>) => {
    setSelectedSet((prev) => {
      const newSet = new Set(prev);

      paymentIds.forEach((id) => {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      });

      return newSet;
    });
  }, []);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedSet(new Set());
  }, []);

  /**
   * Check if a payment ID is selected
   */
  const isSelected = useCallback(
    (id: string): boolean => {
      return selectedSet.has(id);
    },
    [selectedSet]
  );

  // Memoized values to avoid unnecessary re-renders
  const selectedPayments = useMemo(() => {
    return Array.from(selectedSet).sort((a, b) => a.localeCompare(b));
  }, [selectedSet]);

  const selectedCount = selectedSet.size;
  const hasSelections = selectedCount > 0;

  return {
    selectedPayments,
    selectedCount,
    toggleSelection,
    clearSelection,
    isSelected,
    hasSelections
  };
};
