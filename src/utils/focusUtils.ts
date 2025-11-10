/**
 * Utility functions for managing focus and accessibility
 */

/**
 * Makes an HTML element focusable by adding tabindex="-1" if it doesn't already have a tabindex attribute.
 * This allows programmatic focus without making the element part of the normal tab order.
 *
 * @param element - The HTML element to make focusable
 * @returns The same element for chaining
 *
 * @example
 * const container = document.querySelector('[aria-label="results-table"]');
 * if (container) {
 *   makeElementFocusable(container);
 *   container.focus();
 * }
 */
export const makeElementFocusable = (element: HTMLElement): HTMLElement => {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
  return element;
};

/**
 * Resolves the target element to focus by searching for it with a list of selectors
 * starting from a root container; if not found, returns the container itself.
 */
export const resolveFocusTarget = (
  root: HTMLElement | null | undefined,
  selectors: Array<string>
): HTMLElement | null => {
  if (!root) return null;
  for (const selector of selectors) {
    const el = root.querySelector<HTMLElement>(selector);
    if (el) return el;
  }
  return root;
};
