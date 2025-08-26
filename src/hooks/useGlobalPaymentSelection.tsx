/**
 * Custom hook for cross-page IUD selection management
 *
 * Responsibilities:
 * - Maintains global Set of selected IUDs for cross-page persistence
 * - Handles cross-page selection/deselection with unique IUDs from API
 * - Manages form synchronization for selectedPayments and selectedAssessmentDetailIds
 * - Supports both normal mode (IUD selection) and remove mode (assessmentDetailId selection)
 */
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Type for the hook's input parameters
 */
export type UseGlobalPaymentSelectionParams = {
  setValue: (name: string, value: unknown) => void;
  selectedPayments?: Array<string>;
  /** Current page rows for assessmentDetailId mapping in remove mode */
  currentPageRows?: Array<{
    iud: string;
    assessmentDetailId?: number;
  }>;
  isRemoveMode?: boolean;
};

/**
 * Type for the hook's return value
 */
export type UseGlobalPaymentSelectionResult = {
  /** Set of selected IUDs for cross-page persistence */
  globalSelectedIuds: Set<string>;
  /** Toggle IUD selection */
  toggleIudSelection: (iuds: Array<string>, selected: boolean) => void;
  clearAllSelections: () => void;
  /** Check if IUD is selected */
  isIudSelected: (iud: string) => boolean;
  /** Backward compatibility: check if IUD is selected */
  isSelected: (iud: string) => boolean;
  /** Total count of selected items */
  totalSelected: number;
};

/**
 * Custom hook for managing cross-page payment selection state
 *
 * This hook centralizes the selection state management for payment tables
 * with support for cross-page persistence using unique IUDs from API.
 *
 * @param params Hook configuration parameters
 * @returns Selection state and management functions
 *
 */
export const useGlobalPaymentSelection = ({
  setValue,
  selectedPayments = [],
  currentPageRows = [],
  isRemoveMode = false
}: UseGlobalPaymentSelectionParams): UseGlobalPaymentSelectionResult => {
  // Set of selected IUDs for cross-page persistence
  const [globalSelectedIuds, setGlobalSelectedIuds] = useState<Set<string>>(
    new Set()
  );

  // Global mapping for IUD -> assessmentDetailId conversion in remove mode
  const [
    globalIudToAssessmentDetailIdMap,
    setGlobalIudToAssessmentDetailIdMap
  ] = useState<Map<string, number>>(new Map());

  const isInitializedRef = useRef(false);

  // Helper function to convert IUDs to assessment detail IDs for remove mode
  const convertIudsToAssessmentDetailIds = useCallback(
    (iudSet: Set<string>): Array<number> => {
      // Update mapping with current page rows
      const updatedMapping = new Map(globalIudToAssessmentDetailIdMap);
      currentPageRows?.forEach((row) => {
        if (row.iud && row.assessmentDetailId) {
          updatedMapping.set(row.iud, row.assessmentDetailId);
        }
      });

      // Convert IUDs to assessment detail IDs
      const assessmentDetailIds: Array<number> = [];
      iudSet.forEach((iud) => {
        const assessmentDetailId = updatedMapping.get(iud);
        if (assessmentDetailId) {
          assessmentDetailIds.push(assessmentDetailId);
        }
      });

      return assessmentDetailIds.sort((a, b) => a - b);
    },
    [globalIudToAssessmentDetailIdMap, currentPageRows]
  );

  // Update assessment detail mapping when currentPageRows changes (remove mode only)
  useEffect(() => {
    if (currentPageRows.length > 0 && isRemoveMode) {
      setGlobalIudToAssessmentDetailIdMap((prevMap) => {
        const newMap = new Map(prevMap);
        currentPageRows.forEach((row) => {
          if (row.iud && row.assessmentDetailId) {
            newMap.set(row.iud, row.assessmentDetailId);
          }
        });
        return newMap;
      });
    }
  }, [currentPageRows, isRemoveMode]);

  useEffect(() => {
    // Initialize selected IUDs from form data
    if (!isInitializedRef.current && selectedPayments.length > 0) {
      setGlobalSelectedIuds(new Set(selectedPayments));
      isInitializedRef.current = true;
    }
  }, [selectedPayments]);

  // Selection management at IUD level
  const toggleIudSelection = useCallback(
    (iuds: Array<string>, selected: boolean) => {
      // Helper function to update set
      const updateSet = (prev: Set<string>) => {
        const newSet = new Set(prev);
        iuds.forEach((iud) => {
          if (selected) {
            newSet.add(iud);
          } else {
            newSet.delete(iud);
          }
        });
        return newSet;
      };

      // Update state and get the new set
      let newSet: Set<string>;
      setGlobalSelectedIuds((prev) => {
        newSet = updateSet(prev);
        return newSet;
      });

      // Sync to form with the new state
      queueMicrotask(() => {
        const currentSet = newSet!;

        if (isRemoveMode) {
          const selectedAssessmentDetailIds =
            convertIudsToAssessmentDetailIds(currentSet);
          setValue('selectedAssessmentDetailIds', selectedAssessmentDetailIds);
        } else {
          const sortedIuds = Array.from(currentSet).sort((a, b) =>
            a.localeCompare(b)
          );
          setValue('selectedPayments', sortedIuds);
        }
      });
    },
    [setValue, isRemoveMode, convertIudsToAssessmentDetailIds]
  );

  const clearAllSelections = useCallback(() => {
    setGlobalSelectedIuds(new Set());

    setValue('selectedPayments', []);
    if (isRemoveMode) {
      setValue('selectedAssessmentDetailIds', []);
      setGlobalIudToAssessmentDetailIdMap(new Map());
    }
  }, [setValue, isRemoveMode]);

  const isIudSelected = useCallback(
    (iud: string) => {
      return globalSelectedIuds.has(iud);
    },
    [globalSelectedIuds]
  );

  // Backward compatibility function - same as isIudSelected
  const isSelected = useCallback(
    (iud: string) => {
      return globalSelectedIuds.has(iud);
    },
    [globalSelectedIuds]
  );

  return {
    globalSelectedIuds,
    toggleIudSelection,
    clearAllSelections,
    isIudSelected,
    isSelected, // Backward compatibility
    totalSelected: globalSelectedIuds.size
  };
};
