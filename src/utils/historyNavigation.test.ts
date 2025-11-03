import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isPageToSkip,
  getCurrentHistoryState,
  isFormOrWizardUrl,
  hasValidHistory
} from './historyNavigation';

describe('historyNavigation', () => {
  describe('isPageToSkip', () => {
    describe('Success pages detection', () => {
      it('returns true when state has fromSuccess flag', () => {
        const state = { fromSuccess: true };
        expect(isPageToSkip(state)).toBe(true);
      });

      it('returns true when category contains "success"', () => {
        const state = { category: 'client-sil-delete-success' };
        expect(isPageToSkip(state)).toBe(true);
      });

      it('returns true when category contains "success" anywhere', () => {
        const state = { category: 'assessment-create-partial-success' };
        expect(isPageToSkip(state)).toBe(true);
      });

      it('returns false when category does not contain "success"', () => {
        const state = { category: 'some-other-category' };
        expect(isPageToSkip(state)).toBe(false);
      });
    });

    describe('Form/Wizard pages detection via state markers', () => {
      it('returns true when state has fromWizard flag', () => {
        const state = { fromWizard: true };
        expect(isPageToSkip(state)).toBe(true);
      });

      it('returns true when state has fromForm flag', () => {
        const state = { fromForm: true };
        expect(isPageToSkip(state)).toBe(true);
      });

      it('returns false when fromWizard is false', () => {
        const state = { fromWizard: false };
        expect(isPageToSkip(state)).toBe(false);
      });

      it('returns false when fromForm is false', () => {
        const state = { fromForm: false };
        expect(isPageToSkip(state)).toBe(false);
      });
    });

    describe('Form/Wizard pages detection via URL analysis', () => {
      it('returns true for create URLs', () => {
        expect(isPageToSkip({}, '/client-sil/create')).toBe(true);
        expect(isPageToSkip({}, '/org-sil-services/create')).toBe(true);
        expect(isPageToSkip({}, '/assessment/create')).toBe(true);
      });

      it('returns true for edit URLs', () => {
        expect(isPageToSkip({}, '/client-sil/123/edit')).toBe(true);
        expect(isPageToSkip({}, '/org-sil-services/35/edit')).toBe(true);
        expect(isPageToSkip({}, '/organizations/123/edit')).toBe(true);
      });

      it('returns true for new URLs', () => {
        expect(isPageToSkip({}, '/client-sil/new')).toBe(true);
        expect(isPageToSkip({}, '/org-sil-services/new')).toBe(true);
      });

      it('returns true for wizard URLs with mode=add', () => {
        expect(
          isPageToSkip(
            {},
            '/assessment/create?mode=add&assessmentId=123&debtPositionTypeOrgCode=TEST'
          )
        ).toBe(true);
      });

      it('returns true for wizard URLs with mode=remove', () => {
        expect(
          isPageToSkip(
            {},
            '/assessment/create?mode=remove&assessmentId=456&debtPositionTypeOrgCode=TEST'
          )
        ).toBe(true);
      });

      it('returns true for wizard URLs with mode=edit', () => {
        expect(
          isPageToSkip({}, '/org-sil-services/create?mode=edit&id=789')
        ).toBe(true);
      });

      it('returns false for list URLs', () => {
        expect(isPageToSkip({}, '/client-sil')).toBe(false);
        expect(isPageToSkip({}, '/org-sil-services')).toBe(false);
        expect(isPageToSkip({}, '/assessment')).toBe(false);
      });

      it('returns false for detail URLs', () => {
        expect(isPageToSkip({}, '/client-sil/123')).toBe(false);
        expect(isPageToSkip({}, '/client-sil/IPA_TEST_123')).toBe(false);
        expect(isPageToSkip({}, '/org-sil-services/35')).toBe(false);
        expect(isPageToSkip({}, '/assessment/detail/3261')).toBe(false);
      });
    });

    describe('Combined state and URL detection', () => {
      it('prioritizes state markers over URL analysis', () => {
        const state = { fromSuccess: true };
        expect(isPageToSkip(state, '/client-sil')).toBe(true);
      });

      it('falls back to URL analysis when no state markers', () => {
        expect(isPageToSkip({}, '/client-sil/create')).toBe(true);
      });

      it('works with both state and URL indicating skip', () => {
        const state = { fromWizard: true };
        expect(isPageToSkip(state, '/assessment/create?mode=add')).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('returns false when both state and URL are null/undefined', () => {
        expect(isPageToSkip(null)).toBe(false);
        expect(isPageToSkip(undefined)).toBe(false);
        expect(isPageToSkip(null)).toBe(false);
      });

      it('returns false when state is not an object', () => {
        expect(isPageToSkip('string')).toBe(false);
        expect(isPageToSkip(123)).toBe(false);
        expect(isPageToSkip(true)).toBe(false);
      });

      it('returns false when URL is not a string', () => {
        expect(isPageToSkip({}, null as unknown as string)).toBe(false);
        expect(isPageToSkip({}, 123 as unknown as string)).toBe(false);
      });

      it('handles empty state object', () => {
        expect(isPageToSkip({})).toBe(false);
      });

      it('handles empty URL string', () => {
        expect(isPageToSkip({}, '')).toBe(false);
      });

      it('handles URL with hash', () => {
        expect(isPageToSkip({}, '/client-sil/create#section')).toBe(true);
      });

      it('handles URL with query params and hash', () => {
        expect(isPageToSkip({}, '/assessment/create?mode=add#top')).toBe(true);
      });

      it('is case-insensitive for URL patterns', () => {
        expect(isPageToSkip({}, '/CLIENT-SIL/CREATE')).toBe(true);
        expect(isPageToSkip({}, '/org-sil-services/EDIT')).toBe(true);
        expect(isPageToSkip({}, '/assessment/create?MODE=ADD')).toBe(true);
      });
    });
  });

  describe('getCurrentHistoryState', () => {
    const originalHistory = window.history;

    afterEach(() => {
      Object.defineProperty(window, 'history', {
        value: originalHistory,
        writable: true,
        configurable: true
      });
    });

    it('returns state from window.history.state.usr', () => {
      const mockState = { fromSuccess: true, category: 'test' };

      Object.defineProperty(window, 'history', {
        value: {
          state: {
            usr: mockState
          }
        },
        writable: true,
        configurable: true
      });

      expect(getCurrentHistoryState()).toEqual(mockState);
    });

    it('returns undefined when window.history.state is null', () => {
      Object.defineProperty(window, 'history', {
        value: {
          state: null
        },
        writable: true,
        configurable: true
      });

      expect(getCurrentHistoryState()).toBeUndefined();
    });

    it('returns undefined when window.history.state.usr is undefined', () => {
      Object.defineProperty(window, 'history', {
        value: {
          state: {}
        },
        writable: true,
        configurable: true
      });

      expect(getCurrentHistoryState()).toBeUndefined();
    });

    it('returns undefined on error accessing window.history', () => {
      Object.defineProperty(window, 'history', {
        get: () => {
          throw new Error('Access denied');
        },
        configurable: true
      });

      expect(getCurrentHistoryState()).toBeUndefined();
    });

    it('handles complex nested state objects', () => {
      const mockState = {
        fromSuccess: true,
        category: 'test',
        data: {
          nested: {
            value: 123
          }
        }
      };

      Object.defineProperty(window, 'history', {
        value: {
          state: {
            usr: mockState
          }
        },
        writable: true,
        configurable: true
      });

      expect(getCurrentHistoryState()).toEqual(mockState);
    });
  });

  describe('isFormOrWizardUrl', () => {
    describe('Form pages with path segments', () => {
      it('returns true for URLs with /create', () => {
        expect(isFormOrWizardUrl('/client-sil/create')).toBe(true);
        expect(isFormOrWizardUrl('/org-sil-services/create')).toBe(true);
        expect(isFormOrWizardUrl('/assessment/create')).toBe(true);
      });

      it('returns true for URLs with /edit', () => {
        expect(isFormOrWizardUrl('/client-sil/123/edit')).toBe(true);
        expect(isFormOrWizardUrl('/org-sil-services/35/edit')).toBe(true);
      });

      it('returns true for URLs with /new', () => {
        expect(isFormOrWizardUrl('/client-sil/new')).toBe(true);
        expect(isFormOrWizardUrl('/org-sil-services/new')).toBe(true);
      });
    });

    describe('Wizard pages with query parameters', () => {
      it('returns true for URLs with mode=add', () => {
        expect(isFormOrWizardUrl('/assessment/create?mode=add')).toBe(true);
        expect(
          isFormOrWizardUrl('/assessment/create?mode=add&assessmentId=123')
        ).toBe(true);
      });

      it('returns true for URLs with mode=remove', () => {
        expect(isFormOrWizardUrl('/assessment/create?mode=remove')).toBe(true);
        expect(
          isFormOrWizardUrl('/assessment/create?mode=remove&assessmentId=456')
        ).toBe(true);
      });

      it('returns true for URLs with mode=edit', () => {
        expect(isFormOrWizardUrl('/org-sil-services/create?mode=edit')).toBe(
          true
        );
        expect(
          isFormOrWizardUrl('/org-sil-services/create?mode=edit&id=789')
        ).toBe(true);
      });
    });

    describe('Debt Positions exclusion', () => {
      it('returns false for debt position URLs with /create', () => {
        expect(isFormOrWizardUrl('/debt-position/create')).toBe(false);
      });

      it('returns false for debt position URLs with /edit', () => {
        expect(isFormOrWizardUrl('/debt-position/123/edit')).toBe(false);
      });

      it('returns false for debt position URLs with mode params', () => {
        expect(isFormOrWizardUrl('/debt-position/create?mode=add')).toBe(false);
        expect(isFormOrWizardUrl('/debt-position/create?mode=edit')).toBe(
          false
        );
      });

      it('returns false for any debt position URL', () => {
        expect(isFormOrWizardUrl('/debt-position')).toBe(false);
        expect(isFormOrWizardUrl('/debt-position/123')).toBe(false);
      });
    });

    describe('Normal pages', () => {
      it('returns false for list URLs', () => {
        expect(isFormOrWizardUrl('/client-sil')).toBe(false);
        expect(isFormOrWizardUrl('/org-sil-services')).toBe(false);
        expect(isFormOrWizardUrl('/assessment')).toBe(false);
      });

      it('returns false for detail URLs', () => {
        expect(isFormOrWizardUrl('/client-sil/123')).toBe(false);
        expect(isFormOrWizardUrl('/client-sil/IPA_TEST_123')).toBe(false);
        expect(isFormOrWizardUrl('/org-sil-services/35')).toBe(false);
        expect(isFormOrWizardUrl('/assessment/detail/3261')).toBe(false);
      });

      it('returns false for URLs with other query params', () => {
        expect(isFormOrWizardUrl('/client-sil?page=1&size=10')).toBe(false);
        expect(isFormOrWizardUrl('/assessment?filter=active')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('returns false for null or undefined URL', () => {
        expect(isFormOrWizardUrl(null as unknown as string)).toBe(false);
        expect(isFormOrWizardUrl(undefined as unknown as string)).toBe(false);
      });

      it('returns false for non-string URL', () => {
        expect(isFormOrWizardUrl(123 as unknown as string)).toBe(false);
        expect(isFormOrWizardUrl({} as unknown as string)).toBe(false);
      });

      it('returns false for empty string', () => {
        expect(isFormOrWizardUrl('')).toBe(false);
      });

      it('is case-insensitive', () => {
        expect(isFormOrWizardUrl('/CLIENT-SIL/CREATE')).toBe(true);
        expect(isFormOrWizardUrl('/org-sil-services/EDIT')).toBe(true);
        expect(isFormOrWizardUrl('/assessment/create?MODE=ADD')).toBe(true);
      });

      it('handles URLs with hash', () => {
        expect(isFormOrWizardUrl('/client-sil/create#section')).toBe(true);
        expect(isFormOrWizardUrl('/client-sil/123#detail')).toBe(false);
      });

      it('handles complex query strings', () => {
        expect(
          isFormOrWizardUrl(
            '/assessment/create?mode=add&id=123&name=test&filter=active'
          )
        ).toBe(true);
        expect(isFormOrWizardUrl('/client-sil?page=1&size=10&sort=name')).toBe(
          false
        );
      });
    });
  });

  describe('hasValidHistory', () => {
    const originalHistory = window.history;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      Object.defineProperty(window, 'history', {
        value: originalHistory,
        writable: true,
        configurable: true
      });
    });

    it('returns true when history length is greater than 1', () => {
      Object.defineProperty(window, 'history', {
        value: {
          length: 5
        },
        writable: true,
        configurable: true
      });

      expect(hasValidHistory()).toBe(true);
    });

    it('returns true when history length is exactly 2', () => {
      Object.defineProperty(window, 'history', {
        value: {
          length: 2
        },
        writable: true,
        configurable: true
      });

      expect(hasValidHistory()).toBe(true);
    });

    it('returns false when history length is 1', () => {
      Object.defineProperty(window, 'history', {
        value: {
          length: 1
        },
        writable: true,
        configurable: true
      });

      expect(hasValidHistory()).toBe(false);
    });

    it('returns false when history length is 0', () => {
      Object.defineProperty(window, 'history', {
        value: {
          length: 0
        },
        writable: true,
        configurable: true
      });

      expect(hasValidHistory()).toBe(false);
    });

    it('handles very long history', () => {
      Object.defineProperty(window, 'history', {
        value: {
          length: 100
        },
        writable: true,
        configurable: true
      });

      expect(hasValidHistory()).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    describe('Client SIL flow', () => {
      it('identifies success page after creation', () => {
        const successState = {
          category: 'client-sil',
          fromSuccess: true
        };
        expect(isPageToSkip(successState)).toBe(true);
      });

      it('identifies create form page', () => {
        expect(isPageToSkip({}, '/client-sil/create')).toBe(true);
      });

      it('does not skip detail page', () => {
        expect(isPageToSkip({}, '/client-sil/IPA_TEST_123')).toBe(false);
      });

      it('does not skip list page', () => {
        expect(isPageToSkip({}, '/client-sil')).toBe(false);
      });
    });

    describe('Assessment flow', () => {
      it('identifies success page after adding payments', () => {
        const successState = {
          category: 'assessment-add-payments',
          fromSuccess: true
        };
        expect(isPageToSkip(successState)).toBe(true);
      });

      it('identifies wizard page with mode=add', () => {
        const wizardUrl =
          '/assessment/create?mode=add&assessmentId=123&debtPositionTypeOrgCode=TEST';
        expect(isPageToSkip({}, wizardUrl)).toBe(true);
      });

      it('identifies wizard page with mode=remove', () => {
        const wizardUrl =
          '/assessment/create?mode=remove&assessmentId=456&debtPositionTypeOrgCode=TEST';
        expect(isPageToSkip({}, wizardUrl)).toBe(true);
      });

      it('does not skip detail page', () => {
        expect(isPageToSkip({}, '/assessment/detail/3261')).toBe(false);
      });

      it('does not skip search results page', () => {
        expect(isPageToSkip({}, '/assessment/search-results')).toBe(false);
      });
    });

    describe('Org SIL Service flow', () => {
      it('identifies success page after edit', () => {
        const successState = {
          category: 'org-sil-service-edit',
          fromSuccess: true
        };
        expect(isPageToSkip(successState)).toBe(true);
      });

      it('identifies edit form page', () => {
        expect(isPageToSkip({}, '/org-sil-services/35/edit')).toBe(true);
      });

      it('does not skip detail page', () => {
        expect(isPageToSkip({}, '/org-sil-services/35')).toBe(false);
      });

      it('does not skip list page', () => {
        expect(isPageToSkip({}, '/org-sil-services')).toBe(false);
      });
    });
  });
});
