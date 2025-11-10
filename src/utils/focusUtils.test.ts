import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { makeElementFocusable, resolveFocusTarget } from './focusUtils';

describe('focusUtils', () => {
  describe('makeElementFocusable', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
    });

    afterEach(() => {
      element.remove();
    });

    it('should add tabindex="-1" to element without tabindex', () => {
      makeElementFocusable(element);

      expect(element.hasAttribute('tabindex')).toBe(true);
      expect(element.getAttribute('tabindex')).toBe('-1');
    });

    it('should not modify existing tabindex attribute', () => {
      element.setAttribute('tabindex', '0');
      makeElementFocusable(element);

      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('should not modify tabindex when it is already "-1"', () => {
      element.setAttribute('tabindex', '-1');
      makeElementFocusable(element);

      expect(element.getAttribute('tabindex')).toBe('-1');
    });

    it('should return the same element for chaining', () => {
      const result = makeElementFocusable(element);

      expect(result).toBe(element);
    });

    it('should work with different HTML elements', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      const section = document.createElement('section');

      makeElementFocusable(div);
      makeElementFocusable(span);
      makeElementFocusable(section);

      expect(div.getAttribute('tabindex')).toBe('-1');
      expect(span.getAttribute('tabindex')).toBe('-1');
      expect(section.getAttribute('tabindex')).toBe('-1');

      div.remove();
      span.remove();
      section.remove();
    });
  });

  describe('resolveFocusTarget', () => {
    let root: HTMLElement;

    beforeEach(() => {
      root = document.createElement('div');
      root.setAttribute('id', 'root-container');
      document.body.appendChild(root);
    });

    afterEach(() => {
      root.remove();
    });

    it('should return null when root is null', () => {
      const result = resolveFocusTarget(null, ['[role="grid"]']);

      expect(result).toBeNull();
    });

    it('should return null when root is undefined', () => {
      const result = resolveFocusTarget(undefined, ['[role="grid"]']);

      expect(result).toBeNull();
    });

    it('should return the first matching element from selectors', () => {
      const grid = document.createElement('div');
      grid.setAttribute('role', 'grid');
      root.appendChild(grid);

      const result = resolveFocusTarget(root, [
        '[role="grid"]',
        '[role="row"] [role="gridcell"]'
      ]);

      expect(result).toBe(grid);
    });

    it('should try selectors in order and return first match', () => {
      const grid = document.createElement('div');
      grid.setAttribute('role', 'grid');
      root.appendChild(grid);

      const cell = document.createElement('div');
      cell.setAttribute('role', 'gridcell');
      root.appendChild(cell);

      const result = resolveFocusTarget(root, [
        '[role="grid"]',
        '[role="gridcell"]'
      ]);

      expect(result).toBe(grid);
    });

    it('should return root when no selector matches', () => {
      const result = resolveFocusTarget(root, [
        '[role="grid"]',
        '[role="row"] [role="gridcell"]'
      ]);

      expect(result).toBe(root);
    });

    it('should return root when selectors array is empty', () => {
      const result = resolveFocusTarget(root, []);

      expect(result).toBe(root);
    });

    it('should handle nested elements correctly', () => {
      const row = document.createElement('div');
      row.setAttribute('role', 'row');
      root.appendChild(row);

      const cell = document.createElement('div');
      cell.setAttribute('role', 'gridcell');
      row.appendChild(cell);

      const result = resolveFocusTarget(root, [
        '[role="row"] [role="gridcell"]'
      ]);

      expect(result).toBe(cell);
    });

    it('should handle multiple selectors with partial matches', () => {
      const grid = document.createElement('div');
      grid.setAttribute('role', 'grid');
      root.appendChild(grid);

      // First selector doesn't match, second does
      const result = resolveFocusTarget(root, [
        '[role="nonexistent"]',
        '[role="grid"]'
      ]);

      expect(result).toBe(grid);
    });

    it('should handle complex selector hierarchies', () => {
      const grid = document.createElement('div');
      grid.setAttribute('role', 'grid');
      grid.setAttribute('class', 'data-grid');
      root.appendChild(grid);

      const row = document.createElement('div');
      row.setAttribute('role', 'row');
      grid.appendChild(row);

      const cell = document.createElement('div');
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('data-testid', 'first-cell');
      row.appendChild(cell);

      const result = resolveFocusTarget(root, [
        '.data-grid [role="row"] [role="gridcell"]',
        '[role="grid"]'
      ]);

      expect(result).toBe(cell);
    });

    it('should work with attribute selectors', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-label', 'results-table');
      root.appendChild(element);

      const result = resolveFocusTarget(root, ['[aria-label="results-table"]']);

      expect(result).toBe(element);
    });

    it('should work with class selectors', () => {
      const element = document.createElement('div');
      element.className = 'table-container';
      root.appendChild(element);

      const result = resolveFocusTarget(root, ['.table-container']);

      expect(result).toBe(element);
    });

    it('should work with id selectors', () => {
      const element = document.createElement('div');
      element.setAttribute('id', 'target-element');
      root.appendChild(element);

      const result = resolveFocusTarget(root, ['#target-element']);

      expect(result).toBe(element);
    });
  });
});
