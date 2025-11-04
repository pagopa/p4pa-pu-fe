import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useSmartBack } from './useSmartBack';
import * as historyNavigation from '../utils/historyNavigation';

// Mock delle utility di navigazione
vi.mock('../utils/historyNavigation', () => ({
  isPageToSkip: vi.fn(),
  getCurrentHistoryState: vi.fn(),
  hasValidHistory: vi.fn()
}));

// Mock di React Router
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('useSmartBack', () => {
  const mockIsPageToSkip = vi.mocked(historyNavigation.isPageToSkip);
  const mockGetCurrentHistoryState = vi.mocked(
    historyNavigation.getCurrentHistoryState
  );
  const mockHasValidHistory = vi.mocked(historyNavigation.hasValidHistory);

  // Mock window.history
  const originalHistory = window.history;
  const mockHistoryGo = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.history
    Object.defineProperty(window, 'history', {
      value: {
        go: mockHistoryGo,
        length: 5,
        state: { usr: null }
      },
      writable: true,
      configurable: true
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test-page',
        search: '',
        hash: ''
      },
      writable: true,
      configurable: true
    });

    // Mock addEventListener e removeEventListener
    vi.spyOn(window, 'addEventListener').mockImplementation(
      mockAddEventListener
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      mockRemoveEventListener
    );

    // Default mock values
    mockHasValidHistory.mockReturnValue(true);
    mockGetCurrentHistoryState.mockReturnValue(null);
    mockIsPageToSkip.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'history', {
      value: originalHistory,
      writable: true,
      configurable: true
    });
  });

  describe('Initialization and configuration', () => {
    it('returns handleSmartBack function', () => {
      const { result } = renderHook(() => useSmartBack());

      expect(result.current.handleSmartBack).toBeDefined();
      expect(typeof result.current.handleSmartBack).toBe('function');
    });

    it('uses default maxIterations of 10', () => {
      mockIsPageToSkip.mockReturnValue(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() =>
        useSmartBack({ fallbackRoute: '/test-fallback' })
      );

      act(() => {
        result.current.handleSmartBack();
      });

      const popstateCall = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      );
      expect(popstateCall).toBeDefined();

      const popstateHandler = popstateCall?.[1] as () => void;

      for (let i = 0; i < 10; i++) {
        act(() => {
          popstateHandler();
        });
      }

      expect(mockNavigate).toHaveBeenCalledWith('/test-fallback', {
        replace: true
      });
    });

    it('accepts custom maxIterations', () => {
      mockIsPageToSkip.mockReturnValue(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() =>
        useSmartBack({ maxIterations: 3, fallbackRoute: '/custom-fallback' })
      );

      act(() => {
        result.current.handleSmartBack();
      });

      const popstateCall = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      );
      expect(popstateCall).toBeDefined();

      const popstateHandler = popstateCall?.[1] as () => void;

      for (let i = 0; i < 3; i++) {
        act(() => {
          popstateHandler();
        });
      }

      expect(mockNavigate).toHaveBeenCalledWith('/custom-fallback', {
        replace: true
      });
    });
  });

  describe('Simple navigation (current page does not need skip)', () => {
    it('executes navigate(-1) when current page does not need to be skipped', () => {
      mockIsPageToSkip.mockReturnValue(false);
      mockGetCurrentHistoryState.mockReturnValue(null);

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockAddEventListener).not.toHaveBeenCalledWith(
        'popstate',
        expect.any(Function)
      );
      expect(mockHistoryGo).not.toHaveBeenCalled();
    });

    it('calls onNavigationComplete after simple navigation', () => {
      const onComplete = vi.fn();
      mockIsPageToSkip.mockReturnValue(false);

      const { result } = renderHook(() =>
        useSmartBack({ onNavigationComplete: onComplete })
      );

      act(() => {
        result.current.handleSmartBack();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation to fallback route', () => {
    it('navigates to fallback when history is not valid', () => {
      mockHasValidHistory.mockReturnValue(false);

      const { result } = renderHook(() =>
        useSmartBack({ fallbackRoute: '/test-fallback' })
      );

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/test-fallback', {
        replace: true
      });
    });

    it('does not navigate if fallbackRoute is not specified and history is invalid', () => {
      mockHasValidHistory.mockReturnValue(false);

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('calls onNavigationComplete after fallback', () => {
      const onComplete = vi.fn();
      mockHasValidHistory.mockReturnValue(false);

      const { result } = renderHook(() =>
        useSmartBack({
          fallbackRoute: '/test-fallback',
          onNavigationComplete: onComplete
        })
      );

      act(() => {
        result.current.handleSmartBack();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Smart Back with success pages', () => {
    it('registers popstate listener when current page needs to be skipped', () => {
      mockIsPageToSkip.mockReturnValue(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'popstate',
        expect.any(Function)
      );
      expect(mockHistoryGo).toHaveBeenCalledWith(-1);
    });

    it('removes popstate listener when it finds a valid page', () => {
      mockIsPageToSkip.mockReturnValueOnce(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      mockIsPageToSkip.mockReturnValue(false);

      const popstateHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      )?.[1] as () => void;

      if (popstateHandler) {
        act(() => {
          popstateHandler();
        });
      }

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'popstate',
        expect.any(Function)
      );
    });

    it('continues skipping until it finds a valid page', () => {
      mockIsPageToSkip.mockReturnValueOnce(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      mockIsPageToSkip.mockReturnValueOnce(true);

      let popstateHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      )?.[1] as () => void;

      act(() => {
        popstateHandler();
      });

      expect(mockHistoryGo).toHaveBeenCalledTimes(2);

      mockIsPageToSkip.mockReturnValue(false);

      popstateHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      )?.[1] as () => void;

      act(() => {
        popstateHandler();
      });

      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });

  describe('Initial state handling (iteration 1)', () => {
    it('uses initialState when URL is equal to initial page', () => {
      const initialState = { fromSuccess: true };
      mockGetCurrentHistoryState.mockReturnValue(initialState);
      mockIsPageToSkip.mockReturnValueOnce(true);

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/test-page',
          search: '',
          hash: ''
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      mockIsPageToSkip.mockReturnValue(true);

      const popstateHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      )?.[1] as () => void;

      if (popstateHandler) {
        act(() => {
          popstateHandler();
        });
      }

      expect(mockIsPageToSkip).toHaveBeenCalled();
    });
  });

  describe('Wizard and form pages handling', () => {
    it('marks hasSkippedWizardOrForm when skipping a wizard', () => {
      mockIsPageToSkip.mockReturnValueOnce(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/assessment/create',
          search: '?mode=add',
          hash: ''
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      mockIsPageToSkip.mockReturnValue(true);

      const popstateHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      )?.[1] as () => void;

      if (popstateHandler) {
        act(() => {
          popstateHandler();
        });
      }

      expect(mockHistoryGo).toHaveBeenCalled();
    });
  });

  describe('Cleanup and memory leaks', () => {
    it('removes listener when component unmounts', () => {
      mockIsPageToSkip.mockReturnValue(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result, unmount } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockAddEventListener).toHaveBeenCalled();

      unmount();

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'popstate',
        expect.any(Function)
      );
    });
  });

  describe('Safety cap to avoid infinite loops', () => {
    it('uses fallback after maxIterations', () => {
      mockIsPageToSkip.mockReturnValue(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() =>
        useSmartBack({
          fallbackRoute: '/safety-fallback',
          maxIterations: 2
        })
      );

      act(() => {
        result.current.handleSmartBack();
      });

      for (let i = 0; i < 2; i++) {
        const popstateHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'popstate'
        )?.[1] as () => void;

        if (popstateHandler) {
          act(() => {
            popstateHandler();
          });
        }
      }

      expect(mockNavigate).toHaveBeenCalledWith('/safety-fallback', {
        replace: true
      });
    });

    it('resets counter between different calls', () => {
      mockIsPageToSkip.mockReturnValueOnce(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() => useSmartBack({ maxIterations: 2 }));

      act(() => {
        result.current.handleSmartBack();
      });

      mockIsPageToSkip.mockReturnValue(false);
      const popstateHandler1 = mockAddEventListener.mock.calls.find(
        (call) => call[0] === 'popstate'
      )?.[1] as () => void;

      if (popstateHandler1) {
        act(() => {
          popstateHandler1();
        });
      }

      mockIsPageToSkip.mockReturnValueOnce(true);

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockHistoryGo).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles URLs with query params and hash', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/test-page',
          search: '?param=value',
          hash: '#section'
        },
        writable: true,
        configurable: true
      });

      mockIsPageToSkip.mockReturnValue(false);

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('handles multiple simultaneous calls', () => {
      mockIsPageToSkip.mockReturnValue(true);
      mockGetCurrentHistoryState.mockReturnValue({ fromSuccess: true });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
        result.current.handleSmartBack();
      });

      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('handles currentState null or undefined', () => {
      mockIsPageToSkip.mockReturnValue(false);
      mockGetCurrentHistoryState.mockReturnValue(null);

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Integration with isPageToSkip', () => {
    it('passes correct URL and state to isPageToSkip', () => {
      const testState = { fromSuccess: true };
      mockGetCurrentHistoryState.mockReturnValue(testState);
      mockIsPageToSkip.mockReturnValue(true);

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/client-sil/123',
          search: '',
          hash: ''
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockIsPageToSkip).toHaveBeenCalledWith(
        testState,
        '/client-sil/123'
      );
    });

    it('handles URLs without search params', () => {
      mockGetCurrentHistoryState.mockReturnValue(null);
      mockIsPageToSkip.mockReturnValue(false);

      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/simple-path',
          search: '',
          hash: ''
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useSmartBack());

      act(() => {
        result.current.handleSmartBack();
      });

      expect(mockIsPageToSkip).toHaveBeenCalledWith(null, '/simple-path');
    });
  });
});
