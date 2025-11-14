import { useEffect } from 'react';

type UseDataGridTabNavigationParams = {
  containerRef: React.RefObject<HTMLElement>;
  rows?: Array<unknown>;
};

/**
 * Hook to make the DataGrid navigable with Tab key by adding tabIndex={0} to the element with role="grid".
 * This allows keyboard users to navigate to the DataGrid container before entering individual cells.
 *
 * Usage:
 * const tableContainerRef = useRef<HTMLDivElement>(null);
 * useDataGridTabNavigation({ containerRef: tableContainerRef, rows: data });
 *
 * @param containerRef - Ref to the container element that wraps the DataGrid
 * @param rows - Optional array of rows to trigger re-execution when data changes
 */
export function useDataGridTabNavigation({
  containerRef,
  rows
}: UseDataGridTabNavigationParams) {
  useEffect(() => {
    const findAndSetTabIndex = () => {
      const container = containerRef.current;
      if (!container) return;

      const gridElement = container.querySelector<HTMLElement>('[role="grid"]');
      if (gridElement && gridElement.tabIndex < 0) {
        gridElement.tabIndex = 0;
      }
    };

    // Use double requestAnimationFrame to synchronize with the browser rendering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        findAndSetTabIndex();
      });
    });

    // Use MutationObserver on the container to handle the DataGrid re-render
    const container = containerRef.current;
    const observer = container
      ? new MutationObserver(findAndSetTabIndex)
      : null;

    if (observer && container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['role', 'tabindex']
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, [containerRef, rows]);
}
