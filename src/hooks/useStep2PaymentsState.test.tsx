import { describe, it, expect } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useStep2PaymentsState } from './useStep2PaymentsState';
import {
  PagedPaidInstallmentsDTO,
  PaidInstallmentDTO
} from '../api/classifications/paidInstallments/mappings';

describe('useStep2PaymentsState', () => {
  it('should initialize with default empty state', () => {
    const { result } = renderHook(() => useStep2PaymentsState());

    expect(result.current.paymentsData).toEqual({
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    });
    expect(result.current.showPaymentsValidationError).toBe(false);
    expect(result.current.showFiltersValidationError).toBe(false);
    expect(result.current.hasPaymentsData).toBe(false);
    expect(result.current.totalPayments).toBe(0);
  });

  it('should expose all required functions', () => {
    const { result } = renderHook(() => useStep2PaymentsState());

    expect(typeof result.current.updatePaymentsData).toBe('function');
    expect(typeof result.current.resetPaymentsData).toBe('function');
    expect(typeof result.current.setShowPaymentsValidationError).toBe(
      'function'
    );
    expect(typeof result.current.setShowFiltersValidationError).toBe(
      'function'
    );
    expect(typeof result.current.clearValidationErrors).toBe('function');
  });

  describe('updatePaymentsData', () => {
    it('should update payments data correctly', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const mockPaymentsData: PagedPaidInstallmentsDTO = {
        content: [
          {
            iud: 'IUD001',
            iuv: 'IUV001',
            amount: 100.5,
            paymentDateTime: '2023-12-01T10:00:00Z',
            receiptCreationDate: '2023-12-01T11:00:00Z',
            organizationId: 123
          },
          {
            iud: 'IUD002',
            iuv: 'IUV002',
            amount: 200.75,
            paymentDateTime: '2023-12-02T11:30:00Z',
            receiptCreationDate: '2023-12-02T12:00:00Z',
            organizationId: 123
          }
        ],
        size: 10,
        totalElements: 2,
        totalPages: 1,
        number: 0
      };

      act(() => {
        result.current.updatePaymentsData(mockPaymentsData);
      });

      expect(result.current.paymentsData).toEqual(mockPaymentsData);
      expect(result.current.hasPaymentsData).toBe(true);
      expect(result.current.totalPayments).toBe(2);
    });

    it('should handle empty content array', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const mockEmptyData: PagedPaidInstallmentsDTO = {
        content: [],
        size: 10,
        totalElements: 0,
        totalPages: 0,
        number: 0
      };

      act(() => {
        result.current.updatePaymentsData(mockEmptyData);
      });

      expect(result.current.paymentsData).toEqual(mockEmptyData);
      expect(result.current.hasPaymentsData).toBe(false);
      expect(result.current.totalPayments).toBe(0);
    });

    it('should handle null/undefined content by creating empty array', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const mockDataWithNullContent: PagedPaidInstallmentsDTO = {
        content: undefined as unknown as Array<PaidInstallmentDTO>,
        size: 10,
        totalElements: 5,
        totalPages: 1,
        number: 0
      };

      act(() => {
        result.current.updatePaymentsData(mockDataWithNullContent);
      });

      expect(result.current.paymentsData.content).toEqual([]);
      expect(result.current.paymentsData.totalElements).toBe(5);
      expect(result.current.hasPaymentsData).toBe(false);
      expect(result.current.totalPayments).toBe(5);
    });

    it('should create new object references to ensure re-render', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const originalData: PagedPaidInstallmentsDTO = {
        content: [
          {
            iud: 'IUD001',
            iuv: 'IUV001',
            amount: 100.0,
            paymentDateTime: '2023-01-01T10:00:00Z',
            receiptCreationDate: '2023-01-01T11:00:00Z',
            organizationId: 123
          }
        ],
        size: 10,
        totalElements: 1,
        totalPages: 1,
        number: 0
      };

      act(() => {
        result.current.updatePaymentsData(originalData);
      });

      const firstUpdate = result.current.paymentsData;

      act(() => {
        result.current.updatePaymentsData(originalData);
      });

      const secondUpdate = result.current.paymentsData;

      expect(firstUpdate).not.toBe(secondUpdate);
      expect(firstUpdate.content).not.toBe(secondUpdate.content);
      expect(firstUpdate).toEqual(secondUpdate);
    });
  });

  describe('resetPaymentsData', () => {
    it('should reset payments data to initial state', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const mockData: PagedPaidInstallmentsDTO = {
        content: [
          {
            iud: 'IUD001',
            iuv: 'IUV001',
            amount: 100.0,
            paymentDateTime: '2023-01-01T10:00:00Z',
            receiptCreationDate: '2023-01-01T11:00:00Z',
            organizationId: 123
          }
        ],
        size: 20,
        totalElements: 5,
        totalPages: 2,
        number: 1
      };

      act(() => {
        result.current.updatePaymentsData(mockData);
      });

      expect(result.current.hasPaymentsData).toBe(true);

      act(() => {
        result.current.resetPaymentsData();
      });

      expect(result.current.paymentsData).toEqual({
        content: [],
        size: 10,
        totalElements: 0,
        totalPages: 0,
        number: 0
      });
      expect(result.current.hasPaymentsData).toBe(false);
      expect(result.current.totalPayments).toBe(0);
    });
  });

  describe('validation error management', () => {
    it('should manage payments validation error state', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      expect(result.current.showPaymentsValidationError).toBe(false);

      act(() => {
        result.current.setShowPaymentsValidationError(true);
      });

      expect(result.current.showPaymentsValidationError).toBe(true);

      act(() => {
        result.current.setShowPaymentsValidationError(false);
      });

      expect(result.current.showPaymentsValidationError).toBe(false);
    });

    it('should manage filters validation error state', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      expect(result.current.showFiltersValidationError).toBe(false);

      act(() => {
        result.current.setShowFiltersValidationError(true);
      });

      expect(result.current.showFiltersValidationError).toBe(true);

      act(() => {
        result.current.setShowFiltersValidationError(false);
      });

      expect(result.current.showFiltersValidationError).toBe(false);
    });

    it('should clear all validation errors', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      act(() => {
        result.current.setShowPaymentsValidationError(true);
        result.current.setShowFiltersValidationError(true);
      });

      expect(result.current.showPaymentsValidationError).toBe(true);
      expect(result.current.showFiltersValidationError).toBe(true);

      act(() => {
        result.current.clearValidationErrors();
      });

      expect(result.current.showPaymentsValidationError).toBe(false);
      expect(result.current.showFiltersValidationError).toBe(false);
    });
  });

  describe('derived properties', () => {
    it('should correctly calculate hasPaymentsData based on content length', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      expect(result.current.hasPaymentsData).toBe(false);

      act(() => {
        result.current.updatePaymentsData({
          content: [
            {
              iud: 'IUD001',
              iuv: 'IUV001',
              amount: 100.0,
              paymentDateTime: '2023-01-01T10:00:00Z',
              receiptCreationDate: '2023-01-01T11:00:00Z',
              organizationId: 123
            }
          ],
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0
        });
      });

      expect(result.current.hasPaymentsData).toBe(true);

      act(() => {
        result.current.updatePaymentsData({
          content: [],
          size: 10,
          totalElements: 0,
          totalPages: 0,
          number: 0
        });
      });

      expect(result.current.hasPaymentsData).toBe(false);
    });

    it('should correctly return totalPayments from totalElements', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      expect(result.current.totalPayments).toBe(0);

      act(() => {
        result.current.updatePaymentsData({
          content: [
            {
              iud: 'IUD001',
              iuv: 'IUV001',
              amount: 100.0,
              paymentDateTime: '2023-01-01T10:00:00Z',
              receiptCreationDate: '2023-01-01T11:00:00Z',
              organizationId: 123
            },
            {
              iud: 'IUD002',
              iuv: 'IUV002',
              amount: 200.0,
              paymentDateTime: '2023-01-02T10:00:00Z',
              receiptCreationDate: '2023-01-02T11:00:00Z',
              organizationId: 123
            }
          ],
          size: 10,
          totalElements: 25,
          totalPages: 3,
          number: 0
        });
      });

      expect(result.current.totalPayments).toBe(25);
    });
  });

  describe('multiple state updates', () => {
    it('should handle multiple consecutive updates correctly', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      act(() => {
        result.current.updatePaymentsData({
          content: [
            {
              iud: 'IUD001',
              iuv: 'IUV001',
              amount: 100.0,
              paymentDateTime: '2023-01-01T10:00:00Z',
              receiptCreationDate: '2023-01-01T11:00:00Z',
              organizationId: 123
            }
          ],
          size: 10,
          totalElements: 1,
          totalPages: 1,
          number: 0
        });
        result.current.setShowPaymentsValidationError(true);
      });

      expect(result.current.hasPaymentsData).toBe(true);
      expect(result.current.showPaymentsValidationError).toBe(true);

      act(() => {
        result.current.updatePaymentsData({
          content: [
            {
              iud: 'IUD001',
              iuv: 'IUV001',
              amount: 100.0,
              paymentDateTime: '2023-01-01T10:00:00Z',
              receiptCreationDate: '2023-01-01T11:00:00Z',
              organizationId: 123
            },
            {
              iud: 'IUD002',
              iuv: 'IUV002',
              amount: 200.0,
              paymentDateTime: '2023-01-02T10:00:00Z',
              receiptCreationDate: '2023-01-02T11:00:00Z',
              organizationId: 123
            }
          ],
          size: 10,
          totalElements: 2,
          totalPages: 1,
          number: 0
        });
        result.current.setShowFiltersValidationError(true);
      });

      expect(result.current.totalPayments).toBe(2);
      expect(result.current.showPaymentsValidationError).toBe(true);
      expect(result.current.showFiltersValidationError).toBe(true);

      act(() => {
        result.current.clearValidationErrors();
        result.current.resetPaymentsData();
      });

      expect(result.current.hasPaymentsData).toBe(false);
      expect(result.current.showPaymentsValidationError).toBe(false);
      expect(result.current.showFiltersValidationError).toBe(false);
    });
  });

  describe('edge cases and data integrity', () => {
    it('should handle large datasets', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const largeDataset: PagedPaidInstallmentsDTO = {
        content: Array.from({ length: 100 }, (_, index) => ({
          iud: `IUD${String(index + 1).padStart(3, '0')}`,
          iuv: `IUV${String(index + 1).padStart(3, '0')}`,
          amount: (index + 1) * 10.5,
          paymentDateTime: '2023-01-01T10:00:00Z',
          updateDate: '2023-01-01T11:00:00Z',
          organizationId: 123
        })),
        size: 100,
        totalElements: 1000,
        totalPages: 10,
        number: 0
      };

      act(() => {
        result.current.updatePaymentsData(largeDataset);
      });

      expect(result.current.paymentsData.content).toHaveLength(100);
      expect(result.current.totalPayments).toBe(1000);
      expect(result.current.hasPaymentsData).toBe(true);
    });

    it('should maintain data immutability', () => {
      const { result } = renderHook(() => useStep2PaymentsState());

      const originalData: PagedPaidInstallmentsDTO = {
        content: [
          {
            iud: 'IUD001',
            iuv: 'IUV001',
            amount: 100.0,
            paymentDateTime: '2023-01-01T10:00:00Z',
            receiptCreationDate: '2023-01-01T11:00:00Z',
            organizationId: 123
          }
        ],
        size: 10,
        totalElements: 1,
        totalPages: 1,
        number: 0
      };

      act(() => {
        result.current.updatePaymentsData(originalData);
      });

      const storedData = result.current.paymentsData;

      originalData.content.push({
        iud: 'IUD002',
        iuv: 'IUV002',
        amount: 200.0,
        paymentDateTime: '2023-01-02T10:00:00Z',
        receiptCreationDate: '2023-01-02T11:00:00Z',
        organizationId: 123
      });
      originalData.totalElements = 2;

      expect(storedData.content).toHaveLength(1);
      expect(storedData.totalElements).toBe(1);
    });
  });
});
