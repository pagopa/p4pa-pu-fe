import { useCallback, useEffect, useRef, useState } from 'react';

type UseFocusAfterCloseOptions = {
  selectors?: Array<string>;
  retries?: number;
};

type UseFocusAfterCloseParams = {
  isOpen: boolean;
  rootRef: React.RefObject<HTMLElement>;
  options?: UseFocusAfterCloseOptions;
};

/**
 * Hook to set and stabilize the focus after the closing of a container (e.g. Drawer).
 * Usage:
 * const { armFocus } = useFocusAfterClose({ isOpen: drawerOpen, rootRef: tableRef });
 * // before closing the drawer:
 * armFocus();
 */
export function useFocusAfterClose({
  isOpen,
  rootRef,
  options
}: UseFocusAfterCloseParams) {
  const {
    selectors = ['[role="grid"]', '[role="row"] [role="gridcell"]'],
    retries = 3
  } = options || {};

  const [armed, setArmed] = useState(false);
  const retriesRef = useRef<number>(retries);

  const resolveTarget = useCallback((): HTMLElement | null => {
    const root = rootRef.current;
    if (!root) return null;
    for (const sel of selectors) {
      const el = root.querySelector<HTMLElement>(sel);
      if (el) return el;
    }
    return root;
  }, [rootRef, selectors]);

  const makeFocusableAndFocus = useCallback((element: HTMLElement) => {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }
    element.focus();
  }, []);

  const stabilizeFocus = useCallback(
    (element: HTMLElement) => {
      const attempt = () => {
        if (retriesRef.current <= 0) {
          return;
        }
        requestAnimationFrame(() => {
          const active = document.activeElement as HTMLElement | null;
          const stillOurs = active === element || active === rootRef.current;
          if (!stillOurs) {
            element.focus();
          }
          retriesRef.current -= 1;
          attempt();
        });
      };
      attempt();
    },
    [rootRef]
  );

  // Focus when going from open to closed when armed
  useEffect(() => {
    if (!isOpen && armed && rootRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = resolveTarget();
          if (target) {
            makeFocusableAndFocus(target);
            stabilizeFocus(target);
          }
          setArmed(false);
          // reset retry every time
          retriesRef.current = retries;
        });
      });
    }
  }, [
    isOpen,
    armed,
    rootRef,
    resolveTarget,
    makeFocusableAndFocus,
    stabilizeFocus,
    retries
  ]);

  const armFocus = useCallback(() => {
    setArmed(true);
    retriesRef.current = retries;
  }, [retries]);

  return { armFocus, armed };
}
