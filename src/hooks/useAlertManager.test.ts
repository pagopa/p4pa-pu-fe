import { renderHook, act } from '@testing-library/react';
import { useAlertManager } from './useAlertManager';

describe('useAlertManager', () => {
  it('should initialize with no alert', () => {
    const { result } = renderHook(() => useAlertManager());

    expect(result.current.alertState).toBe('none');
    expect(result.current.shouldShowErrorAlert).toBe(false);
    expect(result.current.shouldShowInfoAlert).toBe(false);
  });

  it('should show error alert', () => {
    const { result } = renderHook(() => useAlertManager());

    act(() => {
      result.current.showAlert('error');
    });

    expect(result.current.alertState).toBe('error');
    expect(result.current.shouldShowErrorAlert).toBe(true);
    expect(result.current.shouldShowInfoAlert).toBe(false);
  });

  it('should show info alert when no error', () => {
    const { result } = renderHook(() => useAlertManager());

    act(() => {
      result.current.showAlert('info');
    });

    expect(result.current.alertState).toBe('info');
    expect(result.current.shouldShowErrorAlert).toBe(false);
    expect(result.current.shouldShowInfoAlert).toBe(true);
  });

  it('should prioritize error over info', () => {
    const { result } = renderHook(() => useAlertManager());

    act(() => {
      result.current.showAlert('info');
    });
    expect(result.current.alertState).toBe('info');

    act(() => {
      result.current.showAlert('error');
    });
    expect(result.current.alertState).toBe('error');
    expect(result.current.shouldShowErrorAlert).toBe(true);
    expect(result.current.shouldShowInfoAlert).toBe(false);
  });

  it('should allow info to override error (current implementation)', () => {
    const { result } = renderHook(() => useAlertManager());

    act(() => {
      result.current.showAlert('error');
    });
    expect(result.current.alertState).toBe('error');

    act(() => {
      result.current.showAlert('info');
    });
    expect(result.current.alertState).toBe('info');
    expect(result.current.shouldShowErrorAlert).toBe(false);
    expect(result.current.shouldShowInfoAlert).toBe(true);
  });

  it('should hide alert', () => {
    const { result } = renderHook(() => useAlertManager());

    act(() => {
      result.current.showAlert('error');
    });
    expect(result.current.alertState).toBe('error');

    act(() => {
      result.current.hideAlert();
    });
    expect(result.current.alertState).toBe('none');
  });

  it('should clear all alerts', () => {
    const { result } = renderHook(() => useAlertManager());

    act(() => {
      result.current.showAlert('error');
    });

    act(() => {
      result.current.clearAllAlerts();
    });

    expect(result.current.alertState).toBe('none');
    expect(result.current.shouldShowErrorAlert).toBe(false);
    expect(result.current.shouldShowInfoAlert).toBe(false);
  });
});
