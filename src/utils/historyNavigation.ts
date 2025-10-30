/**
 * Utility functions to manage browser history navigation
 * intelligently, recognizing and handling intermediate pages.
 *
 * These functions are used to implement the "smart back" logic
 * that allows automatically skipping consecutive intermediate pages
 * in history during backward navigation.
 *
 * Pages that are skipped:
 * - Success pages: operation confirmation pages
 * - Form pages: create/edit pages (create, edit, new)
 * - Wizard pages: multi-step pages with query params (mode=add/remove/edit)
 *
 * Smart Back v2 - Recognizes pages via:
 * 1. Explicit state markers: fromSuccess, fromWizard, fromForm
 * 2. URL pattern analysis: /create, /edit, /new, ?mode=add, ?mode=remove
 */

/**
 * Checks whether a page should be skipped during back navigation.
 *
 * A page is skipped if it is a:
 * - Success page: operation confirmation pages
 * - Form page: create/edit pages (create, edit, new)
 * - Wizard page: multi-step pages with query params (mode=add/remove/edit)
 *
 * Recognized via:
 * 1. State markers: `fromSuccess`, `fromWizard`, `fromForm`, `category` containing "success"
 * 2. URL analysis: path segments (/create, /edit, /new) and query params (mode=)
 *
 * @param historyState - The state from history (typically window.history.state.usr)
 * @param url - The full URL (pathname + search) for pattern analysis (optional)
 * @returns true if the page should be skipped during back navigation
 *
 * @example
 * ```typescript
 * // Success pages
 * isPageToSkip({ fromSuccess: true }); // true
 * isPageToSkip({ category: 'client-sil-delete-success' }); // true
 *
 * // Form/Wizard pages (state markers)
 * isPageToSkip({ fromWizard: true }); // true
 * isPageToSkip({ fromForm: true }); // true
 *
 * // Form/Wizard pages (URL analysis)
 * isPageToSkip({}, '/client-sil/create'); // true
 * isPageToSkip({}, '/org-sil-services/123/edit'); // true
 * isPageToSkip({}, '/assessment/create?mode=add'); // true
 *
 * // Normal pages
 * isPageToSkip({}, '/client-sil'); // false
 * isPageToSkip({}, '/client-sil/123'); // false (detail page)
 * ```
 */
export const isPageToSkip = (historyState: unknown, url?: string): boolean => {
  // Guard: if there is neither state nor URL, nothing can be determined
  if (
    (!historyState || typeof historyState !== 'object') &&
    (!url || typeof url !== 'string')
  ) {
    return false;
  }

  const state = historyState as Record<string, unknown> | null;

  // Case 1: Success pages (state markers)
  if (state) {
    // Explicit success page (fromSuccess flag)
    if (state.fromSuccess === true) {
      return true;
    }

    // Success page via category
    if (
      typeof state.category === 'string' &&
      state.category.includes('success')
    ) {
      return true;
    }

    // Case 2: Form/Wizard pages (explicit state markers)
    // These markers may be set explicitly by pages
    if (state.fromWizard === true) {
      return true;
    }

    if (state.fromForm === true) {
      return true;
    }
  }

  // Case 3: Form/Wizard pages (URL analysis fallback)
  // If there are no explicit markers, analyze the URL
  if (url) {
    return isFormOrWizardUrl(url);
  }

  return false;
};

/**
 * @deprecated Use `isPageToSkip` instead. This function will be removed in a future version.
 *
 * Checks whether a history state represents a success page
 * to be ignored during back navigation.
 *
 * @param historyState - The state from history (typically window.history.state.usr)
 * @returns true if it is a success page to ignore during back navigation
 */
export const isSuccessPage = (historyState: unknown): boolean => {
  // Backward compatibility: delegate to new function
  return isPageToSkip(historyState);
};

/**
 * Reads the state of the current position in history.
 *
 * React Router stores user state in `window.history.state.usr`.
 * This function provides safe access to that state, handling
 * potential access errors.
 *
 * @returns The current history state, or undefined if not available
 *
 * @example
 * ```typescript
 * const currentState = getCurrentHistoryState();
 * if (isSuccessPage(currentState)) {
 *   console.log('We are on a success page');
 * }
 * ```
 */
export const getCurrentHistoryState = (): unknown => {
  try {
    // React Router v6 stores state in window.history.state.usr
    return window.history.state?.usr;
  } catch {
    // In case of error (e.g., window access not available), return undefined
    return undefined;
  }
};

/**
 * Checks whether a URL represents a form or wizard page to be skipped
 * during back navigation.
 *
 * Recognizes:
 * - Form pages: path segments containing /create, /new, /edit
 * - Wizard pages: query parameters with mode=add, mode=remove, mode=edit
 *
 * Exclusions:
 * - Debt Positions (/debt-position) → separate custom handling
 *
 * @param url - The full URL (pathname + search) to analyze
 * @returns true if it is a form/wizard page to skip
 *
 * ```
 */
export const isFormOrWizardUrl = (url: string): boolean => {
  // Guard: null or non-string URL
  if (!url || typeof url !== 'string') {
    return false;
  }

  const urlLower = url.toLowerCase();

  // Exclusion: Debt Positions (separate custom handling)
  // Debt positions have custom success page logic
  if (urlLower.includes('/debt-position')) {
    return false;
  }

  // Pattern 1: Form pages with path segments
  // Recognizes URLs containing /create, /new, /edit
  // Example: /client-sil/create, /org-sil-services/new, /organizations/123/edit
  const formPathPatterns = ['/create', '/new', '/edit'];

  if (formPathPatterns.some((pattern) => urlLower.includes(pattern))) {
    return true;
  }

  // Pattern 2: Wizard pages with query parameters
  // Recognizes URLs with query params mode=add, mode=remove, mode=edit
  // Example: /assessment/create?mode=add&assessmentId=123
  const wizardQueryPatterns = ['mode=add', 'mode=remove', 'mode=edit'];

  return wizardQueryPatterns.some((pattern) => urlLower.includes(pattern));
};

/**
 * Checks whether there is sufficient history to navigate back.
 *
 * Ensures there is at least one previous page in history
 * that can be navigated back to.
 *
 * @returns true if it is possible to navigate back, false otherwise
 *
 * @example
 * ```typescript
 * if (hasValidHistory()) {
 *   window.history.back();
 * } else {
 *   console.log('No previous page available');
 * }
 * ```
 */
export const hasValidHistory = (): boolean => {
  // window.history.length includes the current page
  // so > 1 means there is at least one previous page
  return window.history.length > 1;
};
