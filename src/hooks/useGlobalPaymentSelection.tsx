/**
 * Custom hook for cross-page IUD selection management
 *
 * TEMPORARY SOLUTION for duplicate IUDs from backend
 *
 * CURRENTLY:
 * - Maintains global Set of selected uniqueIds (format: iud-index)
 * - Converts to/from IUD only when necessary for form
 * - Handles duplicate IUDs through artificial uniqueIds
 * - Maintains global uniqueId -> IUD mapping for cross-page conversion
 *
 * FUTURE MIGRATION (when backend will have unique IUDs):
 * 1. Change globalSelectedUniqueIds → globalSelectedIuds
 * 2. Remove currentPageRows parameter
 * 3. Eliminate uniqueId ↔ IUD conversion logic
 * 4. Rename toggleUniqueIdSelection → toggleIudSelection
 * 5. Simplify isSelected (no more loop on currentPageRows)
 *
 * Responsibilities:
 * - Maintains global Set of selected uniqueIds (instead of IUDs)
 * - Converts to/from IUD only when necessary for form
 * - Handles cross-page selection/deselection
 * - Solves duplicate IUD problem by managing uniqueIds
 * - Maintains persistent uniqueId -> IUD mapping for cross-page conversion
 */
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Type for the hook's input parameters
 */
export type UseGlobalPaymentSelectionParams = {
  setValue: (name: string, value: unknown) => void;
  selectedPayments?: Array<string>;
  /** TEMPORARY: current page rows for IUD ↔ uniqueId conversion */
  currentPageRows?: Array<{
    uniqueId: string;
    iud: string;
    assessmentDetailId?: number;
  }>;
  isRemoveMode?: boolean;
};

/**
 * Type for the hook's return value
 */
export type UseGlobalPaymentSelectionResult = {
  /** TEMPORARY: Set of selected uniqueIds - will become globalSelectedIuds */
  globalSelectedUniqueIds: Set<string>;
  /** TEMPORARY: Toggle uniqueId selection - will become toggleIudSelection */
  toggleUniqueIdSelection: (
    uniqueIds: Array<string>,
    selected: boolean
  ) => void;
  clearAllSelections: () => void;
  /** TEMPORARY: Check if uniqueId is selected - will become isIudSelected */
  isUniqueIdSelected: (uniqueId: string) => boolean;
  /** Backward compatibility: check if IUD is selected */
  isSelected: (iud: string) => boolean;
  /** Total count of selected items */
  totalSelected: number;
};

/**
 * Custom hook for managing cross-page payment selection state
 *
 * This hook centralizes the selection state management for payment tables
 * with support for cross-page persistence and duplicate IUD handling.
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
  // TEMPORARY: Set of uniqueIds instead of IUDs to handle duplicates
  // FUTURE: const [globalSelectedIuds, setGlobalSelectedIuds] = useState<Set<string>>(new Set());
  const [globalSelectedUniqueIds, setGlobalSelectedUniqueIds] = useState<
    Set<string>
  >(new Set());

  // TEMPORARY: Global mapping for uniqueId -> IUD conversion across pages
  // FUTURE: This will be removed when backend provides unique IUDs
  const [globalUniqueIdToIudMap, setGlobalUniqueIdToIudMap] = useState<
    Map<string, string>
  >(new Map());

  const [
    globalUniqueIdToAssessmentDetailIdMap,
    setGlobalUniqueIdToAssessmentDetailIdMap
  ] = useState<Map<string, number>>(new Map());

  const isInitializedRef = useRef(false);

  // Update global mapping when currentPageRows changes
  useEffect(() => {
    if (currentPageRows.length > 0) {
      setGlobalUniqueIdToIudMap((prevMap) => {
        const newMap = new Map(prevMap);
        currentPageRows.forEach((row) => {
          if (row.uniqueId && row.iud) {
            newMap.set(row.uniqueId, row.iud);
          }
        });
        return newMap;
      });

      if (isRemoveMode) {
        setGlobalUniqueIdToAssessmentDetailIdMap((prevMap) => {
          const newMap = new Map(prevMap);
          currentPageRows.forEach((row) => {
            if (row.uniqueId && row.assessmentDetailId) {
              newMap.set(row.uniqueId, row.assessmentDetailId);
            }
          });
          return newMap;
        });
      }
    }
  }, [currentPageRows, isRemoveMode]);

  useEffect(() => {
    // TEMPORARY: IUD → uniqueId conversion at initialization
    // FUTURE: setGlobalSelectedIuds(new Set(selectedPayments));
    if (!isInitializedRef.current && selectedPayments.length > 0) {
      const uniqueIds = new Set<string>();
      selectedPayments.forEach((iud) => {
        // Find all uniqueIds corresponding to this IUD
        currentPageRows.forEach((row) => {
          if (row.iud === iud) {
            uniqueIds.add(row.uniqueId);
          }
        });
      });
      setGlobalSelectedUniqueIds(uniqueIds);
      isInitializedRef.current = true;
    }
  }, []);

  const updateMappingWithCurrentPage = useCallback(
    (
      globalMapping: Map<string, string>,
      currentRows?: Array<{ uniqueId: string; iud: string }>
    ): Map<string, string> => {
      const updatedMapping = new Map(globalMapping);
      currentRows?.forEach((row) => {
        if (row.uniqueId && row.iud) {
          updatedMapping.set(row.uniqueId, row.iud);
        }
      });
      return updatedMapping;
    },
    []
  );

  const findIudForUniqueId = useCallback(
    (
      uniqueId: string,
      mapping: Map<string, string>,
      currentRows?: Array<{ uniqueId: string; iud: string }>
    ): string | null => {
      const iud = mapping.get(uniqueId);
      if (iud) {
        return iud;
      }

      // FALLBACK: Try to find IUD from currentPageRows if mapping failed
      const fallbackRow = currentRows?.find((row) => row.uniqueId === uniqueId);
      if (fallbackRow?.iud) {
        return fallbackRow.iud;
      }

      return null;
    },
    []
  );

  const convertUniqueIdsToIuds = useCallback(
    (
      uniqueIds: Set<string>,
      mapping: Map<string, string>,
      currentRows?: Array<{ uniqueId: string; iud: string }>
    ): Array<string> => {
      const selectedIuds = new Set<string>();
      uniqueIds.forEach((uniqueId) => {
        const iud = findIudForUniqueId(uniqueId, mapping, currentRows);
        if (iud) {
          selectedIuds.add(iud);
        }
      });
      return Array.from(selectedIuds).sort((a, b) => a.localeCompare(b));
    },
    [findIudForUniqueId]
  );

  const convertUniqueIdsToAssessmentDetailIds = useCallback(
    (
      uniqueIds: Set<string>,
      mapping: Map<string, number>,
      currentRows?: Array<{ uniqueId: string; assessmentDetailId?: number }>
    ): Array<number> => {
      const selectedIds = new Set<number>();
      uniqueIds.forEach((uniqueId) => {
        const assessmentDetailId = mapping.get(uniqueId);
        if (assessmentDetailId) {
          selectedIds.add(assessmentDetailId);
        } else {
          // FALLBACK: Try to find assessmentDetailId from currentRows
          const fallbackRow = currentRows?.find(
            (row) => row.uniqueId === uniqueId
          );
          if (fallbackRow?.assessmentDetailId) {
            selectedIds.add(fallbackRow.assessmentDetailId);
          }
        }
      });

      const result = Array.from(selectedIds).sort((a, b) => a - b);
      return result;
    },
    []
  );

  // Selection management at uniqueId level
  // TEMPORARY: toggleUniqueIdSelection → toggleIudSelection in future
  const toggleUniqueIdSelection = useCallback(
    (uniqueIds: Array<string>, selected: boolean) => {
      setGlobalSelectedUniqueIds((prev) => {
        const newSet = new Set(prev);
        uniqueIds.forEach((uniqueId) => {
          if (selected) {
            newSet.add(uniqueId);
          } else {
            newSet.delete(uniqueId);
          }
        });
        return newSet;
      });

      // Sync immediately to form using global mapping
      queueMicrotask(() => {
        const newSet = new Set(globalSelectedUniqueIds);
        uniqueIds.forEach((uniqueId) => {
          if (selected) {
            newSet.add(uniqueId);
          } else {
            newSet.delete(uniqueId);
          }
        });

        // Update the global mapping with current page rows to avoid timing issues
        const updatedMapping = updateMappingWithCurrentPage(
          globalUniqueIdToIudMap,
          currentPageRows
        );

        if (isRemoveMode) {
          const updatedAssessmentDetailIdMapping = new Map(
            globalUniqueIdToAssessmentDetailIdMap
          );
          currentPageRows?.forEach((row) => {
            if (row.uniqueId && row.assessmentDetailId) {
              updatedAssessmentDetailIdMapping.set(
                row.uniqueId,
                row.assessmentDetailId
              );
            }
          });

          const sortedAssessmentDetailIds =
            convertUniqueIdsToAssessmentDetailIds(
              newSet,
              updatedAssessmentDetailIdMapping,
              currentPageRows
            );

          setValue('selectedAssessmentDetailIds', sortedAssessmentDetailIds);
        } else {
          const sortedArray = convertUniqueIdsToIuds(
            newSet,
            updatedMapping,
            currentPageRows
          );

          setValue('selectedPayments', sortedArray);
        }
      });
    },
    [
      setValue,
      globalSelectedUniqueIds,
      globalUniqueIdToIudMap,
      currentPageRows,
      updateMappingWithCurrentPage,
      convertUniqueIdsToIuds,
      isRemoveMode,
      globalUniqueIdToAssessmentDetailIdMap,
      convertUniqueIdsToAssessmentDetailIds
    ]
  );

  const clearAllSelections = useCallback(() => {
    setGlobalSelectedUniqueIds(new Set());
    setGlobalUniqueIdToIudMap(new Map());

    setValue('selectedPayments', []);
    if (isRemoveMode) {
      setValue('selectedAssessmentDetailIds', []);
      setGlobalUniqueIdToAssessmentDetailIdMap(new Map());
    }
  }, [setValue, isRemoveMode, setGlobalUniqueIdToAssessmentDetailIdMap]);

  const isUniqueIdSelected = useCallback(
    (uniqueId: string) => {
      return globalSelectedUniqueIds.has(uniqueId);
    },
    [globalSelectedUniqueIds]
  );

  // Helper to convert IUD to uniqueId for backward compatibility
  // TEMPORARY: This function will be simplified when IUDs are unique
  // FUTURE: isSelected = (iud: string) => globalSelectedIuds.has(iud);
  const isSelected = useCallback(
    (iud: string) => {
      // Find if at least one uniqueId with this IUD is selected
      return currentPageRows.some(
        (row) => row.iud === iud && globalSelectedUniqueIds.has(row.uniqueId)
      );
    },
    [globalSelectedUniqueIds, currentPageRows]
  );

  return {
    globalSelectedUniqueIds, // TEMPORARY: will become globalSelectedIuds
    toggleUniqueIdSelection, // TEMPORARY: will become toggleIudSelection
    clearAllSelections,
    isUniqueIdSelected, // TEMPORARY: will become isIudSelected
    isSelected, // Backward compatibility
    totalSelected: globalSelectedUniqueIds.size
  };
};
