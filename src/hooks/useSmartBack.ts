import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  isPageToSkip,
  getCurrentHistoryState,
  hasValidHistory
} from '../utils/historyNavigation';

/**
 * Checks whether a URL represents a detail page.
 * Analyzes the last path segment to identify numeric or alphanumeric IDs.
 *
 * Recognized patterns:
 * - `/org-sil-services/35` → numeric ID (detail)
 * - `/client-sil/IPA_TEST_123` → uppercase alphanumeric ID (detail)
 * - `/assessment/detail/3261` → presence of "detail" in the path (detail)
 *
 * Excluded patterns:
 * - `/org-sil-services/` → no ID (list)
 * - `/org-sil-services/create` → keyword "create" (form)
 * - `/org-sil-services/35/edit` → keyword "edit" (form)
 *
 * @param url - Full URL or pathname to analyze
 * @returns true if it is a detail page
 */
const isDetailPageUrl = (url: string): boolean => {
  if (!url) return false;

  // Remove query params and hash
  const pathname = url.split('?')[0].split('#')[0];

  // Explicitly exclude form/wizard pages
  const excludedKeywords = ['/edit', '/create', '/new'];
  if (excludedKeywords.some((keyword) => pathname.includes(keyword))) {
    return false;
  }

  // If path contains "detail", it is definitely a detail page
  if (pathname.includes('/detail/')) {
    return true;
  }

  // Get the last path segment
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) return false;

  // Check if it is a numeric ID (digits only)
  const isNumericId = /^\d+$/.test(lastSegment);

  // Check if it is an uppercase alphanumeric ID (e.g., IPA_TEST_123)
  const isAlphanumericId = /^[A-Z0-9_]+$/.test(lastSegment);

  return isNumericId || isAlphanumericId;
};

/**
 * Configuration options for the useSmartBack hook
 */
type UseSmartBackOptions = {
  /**
   * Fallback route (full path) used when the history
   * does not contain valid pages or the safety cap is reached.
   *
   * @example '/piattaformaunitaria/backoffice/client-sil'
   */
  fallbackRoute?: string;

  /**
   * Maximum number of back iterations in the history to avoid infinite loops.
   * Default: 10 (sufficient for complex flows with multiple wizards)
   */
  maxIterations?: number;

  /**
   * Callback invoked when the back navigation is completed
   * (either successfully or via fallback)
   */
  onNavigationComplete?: () => void;
};

/**
 * Return value of the useSmartBack hook
 */
type UseSmartBackReturn = {
  /**
   * Function that performs smart back navigation
   * automatically skipping consecutive success pages
   */
  handleSmartBack: () => void;
};

/**
 * Hook to handle smart "back" navigation that automatically skips
 * consecutive intermediate pages present in history.
 *
 * Smart Back v2 - Recognizes and skips:
 * - Success pages (fromSuccess, category containing "success")
 * - Form pages (create, edit, new)
 * - Wizard pages (mode=add, mode=remove, mode=edit)
 *
 * This hook implements logic that:
 * 1. Detects if the current page should be skipped (via state + URL analysis)
 * 2. Executes navigate(-1) and listens to the popstate event
 * 3. If the reached page should still be skipped, continues going back
 * 4. Stops when it finds a valid page or reaches the safety cap
 * 5. Navigates to fallbackRoute if configured and the history is not valid
 *
 * @param options - Optional hook configuration
 * @returns Object containing handleSmartBack function
 *
 * @example
 * ```typescript
 * // In a component that renders a back button
 * const { handleSmartBack } = useSmartBack({
 *   fallbackRoute: '/client-sil',
 *   maxIterations: 5,
 *   onNavigationComplete: () => console.log('Back completed')
 * });
 *
 * return (
 *   <Button onClick={handleSmartBack}>
 *     Back
 *   </Button>
 * );
 * ```
 */
export const useSmartBack = (
  options: UseSmartBackOptions = {}
): UseSmartBackReturn => {
  const navigate = useNavigate();

  // Refs to track internal state without causing re-renders
  const iterationCountRef = useRef(0);
  const hasSkippedWizardOrFormRef = useRef(false);
  const popstateHandlerRef = useRef<((event: PopStateEvent) => void) | null>(
    null
  );

  const { fallbackRoute, maxIterations = 10, onNavigationComplete } = options;

  /**
   * Cleans up listeners and resets internal state
   */
  const cleanup = useCallback(() => {
    if (popstateHandlerRef.current) {
      window.removeEventListener('popstate', popstateHandlerRef.current);
      popstateHandlerRef.current = null;
    }
    iterationCountRef.current = 0;
    hasSkippedWizardOrFormRef.current = false;
  }, []);

  /**
   * Navigates to the fallback route if configured
   */
  const navigateToFallback = useCallback(() => {
    cleanup();
    if (fallbackRoute) {
      navigate(fallbackRoute, { replace: true });
    }
    onNavigationComplete?.();
  }, [fallbackRoute, navigate, cleanup, onNavigationComplete]);

  /**
   * Executes smart back navigation
   */
  const handleSmartBack = useCallback(() => {
    // Guard: no available history, go to fallback
    if (!hasValidHistory()) {
      navigateToFallback();
      return;
    }

    // Check whether current page should be skipped
    const currentState = getCurrentHistoryState();
    const currentUrl = window.location.pathname + window.location.search;
    const shouldSkipCurrent = isPageToSkip(currentState, currentUrl);

    // Simple case: current page does not require skip, perform normal back
    if (!shouldSkipCurrent) {
      navigate(-1);
      onNavigationComplete?.();
      return;
    }

    // Complex case: current page must be skipped, start skip chain
    iterationCountRef.current = 0;
    hasSkippedWizardOrFormRef.current = false;

    // Save URL and state of the current page (before go(-1))
    const initialUrl = currentUrl;
    const initialState = currentState;

    /**
     * Popstate handler that checks each reached page
     * during back navigation and decides whether to continue or stop
     */
    const handlePopstate = () => {
      iterationCountRef.current++;

      // Safety cap reached: too many consecutive backs, go to fallback
      if (iterationCountRef.current >= maxIterations) {
        navigateToFallback();
        return;
      }

      // Get URL and state of the just reached page
      const newUrl = window.location.pathname + window.location.search;
      const newState = getCurrentHistoryState();

      // On iteration 1, we might still be on the initial page
      // (state changes before the actual navigation)
      // Use the initial state if the URL is still the same
      const isStillOnInitialPage =
        iterationCountRef.current === 1 && newUrl === initialUrl;
      const stateToCheck = isStillOnInitialPage ? initialState : newState;
      const shouldSkipThis = isPageToSkip(stateToCheck, newUrl);

      // Check whether this page is a wizard/form
      const isWizardOrForm =
        newUrl.includes('/create') ||
        newUrl.includes('/edit') ||
        newUrl.includes('/new') ||
        newUrl.includes('mode=add') ||
        newUrl.includes('mode=remove') ||
        newUrl.includes('mode=edit');

      if (isWizardOrForm && shouldSkipThis) {
        hasSkippedWizardOrFormRef.current = true;
      }

      if (shouldSkipThis) {
        // Page still needs to be skipped, continue traversing history
        window.history.go(-1);
      } else if (hasSkippedWizardOrFormRef.current) {
        // If at least one wizard/form was skipped
        // and we are now on a "valid" page (not to be skipped),
        // keep going back until reaching the list

        // Check if we are on a Detail page
        const isDetailPage = isDetailPageUrl(newUrl);

        if (isDetailPage) {
          // Still on a detail → continue
          window.history.go(-1);
        } else {
          // Not a detail → we reached the list
          hasSkippedWizardOrFormRef.current = false;
          cleanup();
          onNavigationComplete?.();
        }
      } else {
        // Valid page reached (not to be skipped, no previous wizard)
        // BUT verify if it is still a Detail after multiple edits
        const isDetailPage = isDetailPageUrl(newUrl);

        if (isDetailPage && iterationCountRef.current > 1) {
          // Still on a detail after skipping → continue (multiple edits)
          window.history.go(-1);
        } else {
          // Valid page reached
          cleanup();
          onNavigationComplete?.();
        }
      }
    };

    // Register the popstate event listener
    popstateHandlerRef.current = handlePopstate;
    window.addEventListener('popstate', handlePopstate);

    // Perform the first step back in history
    window.history.go(-1);
  }, [
    navigate,
    navigateToFallback,
    cleanup,
    maxIterations,
    onNavigationComplete
  ]);

  return {
    handleSmartBack
  };
};
