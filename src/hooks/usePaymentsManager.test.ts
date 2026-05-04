import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePaymentsManager } from './usePaymentsManager';
import type { UsePaymentsManagerParams } from '../models/PaymentsManager';

const mockShowAlert = vi.fn();
const mockHideAlert = vi.fn();
const mockClearAllAlerts = vi.fn();

vi.mock('./useAlertManager', () => ({
  useAlertManager: vi.fn(() => ({
    alertState: 'none',
    shouldShowErrorAlert: false,
    shouldShowInfoAlert: false,
    showAlert: mockShowAlert,
    hideAlert: mockHideAlert,
    clearAllAlerts: mockClearAllAlerts
  }))
}));

describe('usePaymentsManager', () => {
  const mockOnPaymentsValidationChange = vi.fn();
  const mockOnFiltersValidationChange = vi.fn();

  const defaultParams: UsePaymentsManagerParams = {
    shouldLoadData: true,
    selectedPayments: [],
    paymentsValidationError: false,
    filtersValidationError: false,
    onPaymentsValidationChange: mockOnPaymentsValidationChange,
    onFiltersValidationChange: mockOnFiltersValidationChange,
    totalSelected: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    expect(result.current.alertState).toBe('none');
    expect(result.current.shouldShowErrorAlert).toBe(false);
    expect(result.current.shouldShowInfoAlert).toBe(false);
  });

  it('should show error alert when paymentsValidationError is true and no selections', async () => {
    const params: UsePaymentsManagerParams = {
      ...defaultParams,
      paymentsValidationError: true,
      totalSelected: 0
    };

    renderHook(() => usePaymentsManager(params));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockShowAlert).toHaveBeenCalledWith('error');
  });

  it('should show info alert when there are selections', async () => {
    const params: UsePaymentsManagerParams = {
      ...defaultParams,
      totalSelected: 3
    };

    renderHook(() => usePaymentsManager(params));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockShowAlert).toHaveBeenCalledWith('info');
  });

  it('should hide alert when no validation error and no selections', async () => {
    const params: UsePaymentsManagerParams = {
      ...defaultParams,
      paymentsValidationError: false,
      totalSelected: 0
    };

    renderHook(() => usePaymentsManager(params));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockHideAlert).toHaveBeenCalled();
  });

  it('should auto-hide validation error when selections are made', () => {
    const params: UsePaymentsManagerParams = {
      ...defaultParams,
      paymentsValidationError: true,
      totalSelected: 2
    };

    renderHook(() => usePaymentsManager(params));

    expect(mockOnPaymentsValidationChange).toHaveBeenCalledWith(false);
  });

  it('should call showValidationError correctly', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    act(() => {
      result.current.showValidationError(true);
    });

    expect(mockOnPaymentsValidationChange).toHaveBeenCalledWith(true);
    expect(mockShowAlert).toHaveBeenCalledWith('error');

    act(() => {
      result.current.showValidationError(false);
    });

    expect(mockOnPaymentsValidationChange).toHaveBeenCalledWith(false);
    expect(mockHideAlert).toHaveBeenCalled();
  });

  it('should call showFilterValidationError correctly', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    act(() => {
      result.current.showFilterValidationError(true);
    });

    expect(mockOnFiltersValidationChange).toHaveBeenCalledWith(true);

    act(() => {
      result.current.showFilterValidationError(false);
    });

    expect(mockOnFiltersValidationChange).toHaveBeenCalledWith(false);
  });

  it('should clear all selections correctly', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    act(() => {
      result.current.clearAllSelections();
    });

    expect(mockHideAlert).toHaveBeenCalled();
  });

  it('should clear all alerts correctly', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    act(() => {
      result.current.clearAllAlerts();
    });

    expect(mockClearAllAlerts).toHaveBeenCalled();
  });

  it('should hide alert when hideAlert is called', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    act(() => {
      result.current.hideAlert();
    });

    expect(mockHideAlert).toHaveBeenCalled();
  });

  it('should show alert with specified type when showAlert is called', () => {
    const { result } = renderHook(() => usePaymentsManager(defaultParams));

    act(() => {
      result.current.showAlert('error');
    });

    expect(mockShowAlert).toHaveBeenCalledWith('error');

    act(() => {
      result.current.showAlert('info');
    });

    expect(mockShowAlert).toHaveBeenCalledWith('info');
  });

  it('should handle complex scenario: error with selections should auto-hide validation', () => {
    let params: UsePaymentsManagerParams = {
      ...defaultParams,
      paymentsValidationError: true,
      totalSelected: 0
    };

    const { rerender } = renderHook(() => usePaymentsManager(params));

    expect(mockShowAlert).toHaveBeenCalledWith('error');

    params = {
      ...params,
      totalSelected: 2
    };

    rerender();

    expect(mockOnPaymentsValidationChange).toHaveBeenCalledWith(false);
    expect(mockShowAlert).toHaveBeenCalledWith('info');
  });

  it('should not show error alert if there are selections even with validation error', () => {
    const params: UsePaymentsManagerParams = {
      ...defaultParams,
      paymentsValidationError: true,
      totalSelected: 1
    };

    renderHook(() => usePaymentsManager(params));

    expect(mockShowAlert).not.toHaveBeenCalledWith('error');
    expect(mockShowAlert).toHaveBeenCalledWith('info');
  });

  it('should handle totalSelected parameter defaulting to 0', () => {
    const params: UsePaymentsManagerParams = {
      shouldLoadData: true,
      selectedPayments: [],
      paymentsValidationError: true,
      filtersValidationError: false,
      onPaymentsValidationChange: mockOnPaymentsValidationChange,
      onFiltersValidationChange: mockOnFiltersValidationChange
    };

    renderHook(() => usePaymentsManager(params));

    expect(mockShowAlert).toHaveBeenCalledWith('error');
  });
});
