/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClassificationAlert } from './useClassificationAlert';
import {
  ClassificationDetailDTO,
  ClassificationsEnum
} from '../../../../generated/data-contracts';

vi.mock('../utils/classificationAlerts', () => ({
  CLASSIFICATION_SEVERITY_MAP: {
    // SUCCESS
    IUD_RT_IUF: 'success',
    RT_IUF: 'success',
    RT_TES: 'success',
    IUD_RT_IUF_TES: 'success',
    RT_IUF_TES: 'success',

    // WARNING
    RT_NO_IUF: 'warning',
    RT_NO_IUD: 'warning',
    IUF_NO_TES: 'warning',

    // ERROR
    DOPPI: 'error',
    IUV_NO_RT: 'error',
    TES_NO_IUF_OR_IUV: 'error',
    IUF_TES_DIV_IMP: 'error',
    IUD_NO_RT: 'error',
    TES_NO_MATCH: 'error',
    UNKNOWN: 'error'
  },
  CLASSIFICATION_ALERT_KEYS: {
    // SUCCESS
    IUD_RT_IUF: {
      title:
        'classifications.detail.statusBar.status.alerts.correctlyReported.title',
      description:
        'classifications.detail.statusBar.status.alerts.correctlyReported.description'
    },
    RT_IUF: {
      title: 'classifications.detail.statusBar.status.alerts.reported.title',
      description:
        'classifications.detail.statusBar.status.alerts.reported.description'
    },
    RT_TES: {
      title:
        'classifications.detail.statusBar.status.alerts.punctualReversal.title',
      description:
        'classifications.detail.statusBar.status.alerts.punctualReversal.description'
    },
    IUD_RT_IUF_TES: {
      title: 'classifications.detail.statusBar.status.alerts.notified.title',
      description:
        'classifications.detail.statusBar.status.alerts.notified.description'
    },
    RT_IUF_TES: {
      title:
        'classifications.detail.statusBar.status.alerts.cumulativeReversal.title',
      description:
        'classifications.detail.statusBar.status.alerts.cumulativeReversal.description'
    },

    // WARNING
    RT_NO_IUF: {
      title:
        'classifications.detail.statusBar.status.alerts.incorrectlyReported.title',
      description:
        'classifications.detail.statusBar.status.alerts.incorrectlyReported.description'
    },
    RT_NO_IUD: {
      title:
        'classifications.detail.statusBar.status.alerts.incorrectlyNotified.title',
      description:
        'classifications.detail.statusBar.status.alerts.incorrectlyNotified.description'
    },
    IUF_NO_TES: {
      title:
        'classifications.detail.statusBar.status.alerts.incorrectlyReversed.title',
      description:
        'classifications.detail.statusBar.status.alerts.incorrectlyReversed.description'
    },

    // ERROR
    DOPPI: {
      title:
        'classifications.detail.statusBar.status.alerts.duplicatePayments.title',
      description:
        'classifications.detail.statusBar.status.alerts.duplicatePayments.description'
    },
    IUV_NO_RT: {
      title:
        'classifications.detail.statusBar.status.alerts.unexecutedReporting.title',
      description:
        'classifications.detail.statusBar.status.alerts.unexecutedReporting.description'
    },
    TES_NO_IUF_OR_IUV: {
      title:
        'classifications.detail.statusBar.status.alerts.unrecognizedReversal.title',
      description:
        'classifications.detail.statusBar.status.alerts.unrecognizedReversal.description'
    },
    IUF_TES_DIV_IMP: {
      title:
        'classifications.detail.statusBar.status.alerts.differentAmountReversal.title',
      description:
        'classifications.detail.statusBar.status.alerts.differentAmountReversal.description'
    },
    IUD_NO_RT: {
      title:
        'classifications.detail.statusBar.status.alerts.notifiedNotExecuted.title',
      description:
        'classifications.detail.statusBar.status.alerts.notifiedNotExecuted.description'
    },
    TES_NO_MATCH: {
      title:
        'classifications.detail.statusBar.status.alerts.unrecognizedTreasuryReversal.title',
      description:
        'classifications.detail.statusBar.status.alerts.unrecognizedTreasuryReversal.description'
    },
    UNKNOWN: {
      title: 'classifications.detail.statusBar.status.alerts.default.title',
      description:
        'classifications.detail.statusBar.status.alerts.default.description'
    }
  }
}));

describe('useClassificationAlert Hook', () => {
  const createMockData = (
    overrides: Partial<ClassificationDetailDTO> = {}
  ): ClassificationDetailDTO => ({
    payed: false,
    reported: false,
    collected: false,
    label: ClassificationsEnum.UNKNOWN,
    debtPositionTypeOrgCode: undefined,
    remittanceInformation: undefined,
    receiptPaymentAmount: undefined,
    receiptPaymentDateTime: undefined,
    iuv: undefined,
    iud: undefined,
    iur: undefined,
    receiptDebtor: undefined,
    receiptPayer: undefined,
    paymentNotificationDebtPositionTypeOrgCode: undefined,
    paymentNotificationRemittanceInformation: undefined,
    paymentNotificationAmountPaidCents: undefined,
    paymentNotificationDebtor: undefined,
    paymentExecutionDate: undefined,
    paymentNotificationIud: undefined,
    iuf: undefined,
    flowDateTime: undefined,
    regulationUniqueIdentifier: undefined,
    regionValueDate: undefined,
    totalAmountCents: undefined,
    sealCode: undefined,
    pspLastName: undefined,
    documentCode: undefined,
    billDate: undefined,
    billYear: undefined,
    provisionalAe: undefined,
    receptionDate: undefined,
    billCode: undefined,
    provisionalCode: undefined,
    receiptPaymentReceiptId: undefined,
    receiptPaymentRequestId: undefined,
    treasuryId: undefined,
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Special case: Unknown Treasury Reversals', () => {
    it('returns error severity when not payed, not reported, but collected', () => {
      const mockData = createMockData({
        payed: false,
        reported: false,
        collected: true,
        label: ClassificationsEnum.IUD_RT_IUF
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.description'
      });
    });

    it('does not trigger special case when payed is true', () => {
      const mockData = createMockData({
        payed: true,
        reported: false,
        collected: true,
        label: ClassificationsEnum.IUD_RT_IUF
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.description'
      });
    });

    it('does not trigger special case when reported is true', () => {
      const mockData = createMockData({
        payed: false,
        reported: true,
        collected: true,
        label: ClassificationsEnum.IUD_RT_IUF
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.description'
      });
    });

    it('does not trigger special case when collected is false', () => {
      const mockData = createMockData({
        payed: false,
        reported: false,
        collected: false,
        label: ClassificationsEnum.IUD_RT_IUF
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.description'
      });
    });
  });

  describe('Success classifications', () => {
    it('returns success severity for IUD_RT_IUF classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.IUD_RT_IUF,
        payed: true,
        reported: true,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.description'
      });
    });

    it('returns success severity for RT_IUF classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.RT_IUF,
        payed: false,
        reported: true,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.reported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.reported.description'
      });
    });

    it('returns success severity for RT_TES classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.RT_TES,
        payed: false,
        reported: true,
        collected: true
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.punctualReversal.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.punctualReversal.description'
      });
    });

    it('returns success severity for IUD_RT_IUF_TES classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.IUD_RT_IUF_TES,
        payed: true,
        reported: true,
        collected: true
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.notified.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.notified.description'
      });
    });

    it('returns success severity for RT_IUF_TES classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.RT_IUF_TES,
        payed: false,
        reported: true,
        collected: true
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.cumulativeReversal.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.cumulativeReversal.description'
      });
    });
  });

  describe('Warning classifications', () => {
    it('returns warning severity for RT_NO_IUF classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.RT_NO_IUF,
        payed: false,
        reported: true,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'warning',
        titleKey:
          'classifications.detail.statusBar.status.alerts.incorrectlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.incorrectlyReported.description'
      });
    });

    it('returns warning severity for RT_NO_IUD classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.RT_NO_IUD,
        payed: false,
        reported: true,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'warning',
        titleKey:
          'classifications.detail.statusBar.status.alerts.incorrectlyNotified.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.incorrectlyNotified.description'
      });
    });

    it('returns warning severity for IUF_NO_TES classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.IUF_NO_TES,
        payed: false,
        reported: false,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'warning',
        titleKey:
          'classifications.detail.statusBar.status.alerts.incorrectlyReversed.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.incorrectlyReversed.description'
      });
    });
  });

  describe('Error classifications', () => {
    it('returns error severity for DOPPI classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.DOPPI,
        payed: true,
        reported: true,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.duplicatePayments.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.duplicatePayments.description'
      });
    });

    it('returns error severity for IUV_NO_RT classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.IUV_NO_RT,
        payed: true,
        reported: false,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.unexecutedReporting.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.unexecutedReporting.description'
      });
    });

    it('returns error severity for TES_NO_IUF_OR_IUV classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.TES_NO_IUF_OR_IUV,
        payed: false,
        reported: false,
        collected: true
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.description'
      });
    });

    it('returns error severity for TES_NO_IUF_OR_IUV classification without special case', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.TES_NO_IUF_OR_IUV,
        payed: true,
        reported: false,
        collected: true
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.unrecognizedReversal.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.unrecognizedReversal.description'
      });
    });

    it('returns error severity for UNKNOWN classification', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.UNKNOWN,
        payed: false,
        reported: false,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.default.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.default.description'
      });
    });
  });

  describe('Fallback behavior', () => {
    it('falls back to UNKNOWN classification when label is not in map', () => {
      const mockData = createMockData({
        label: 'INVALID_CLASSIFICATION' as ClassificationsEnum,
        payed: false,
        reported: false,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.default.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.default.description'
      });
    });

    it('handles undefined/null label gracefully', () => {
      const mockData = createMockData({
        label: undefined as any,
        payed: false,
        reported: false,
        collected: false
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.default.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.default.description'
      });
    });
  });

  describe('Memoization behavior', () => {
    it('returns the same object reference for the same input', () => {
      const mockData = createMockData({
        label: ClassificationsEnum.IUD_RT_IUF,
        payed: true,
        reported: true,
        collected: false
      });

      const { result, rerender } = renderHook(() =>
        useClassificationAlert(mockData)
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('returns different object when data changes', () => {
      let mockData = createMockData({
        label: ClassificationsEnum.IUD_RT_IUF,
        payed: true,
        reported: true,
        collected: false
      });

      const { result, rerender } = renderHook(
        (data) => useClassificationAlert(data),
        { initialProps: mockData }
      );

      const firstResult = result.current;

      mockData = createMockData({
        label: ClassificationsEnum.DOPPI,
        payed: false,
        reported: false,
        collected: false
      });

      rerender(mockData);
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(firstResult.severity).toBe('success');
      expect(secondResult.severity).toBe('error');
    });
  });

  describe('Edge cases', () => {
    it('handles Boolean conversion for falsy values', () => {
      const mockData = createMockData({
        payed: 0 as any,
        reported: '' as any,
        collected: null as any,
        label: ClassificationsEnum.IUD_RT_IUF
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.description'
      });
    });

    it('handles Boolean conversion for truthy values', () => {
      const mockData = createMockData({
        payed: false,
        reported: false,
        collected: 'any string' as any,
        label: ClassificationsEnum.IUD_RT_IUF
      });

      const { result } = renderHook(() => useClassificationAlert(mockData));

      expect(result.current).toEqual({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.description'
      });
    });

    it('triggers special case regardless of classification when conditions match', () => {
      const testCases = [
        ClassificationsEnum.IUD_RT_IUF,
        ClassificationsEnum.RT_NO_IUF,
        ClassificationsEnum.DOPPI,
        ClassificationsEnum.UNKNOWN
      ];

      testCases.forEach((classification) => {
        const mockData = createMockData({
          payed: false,
          reported: false,
          collected: true,
          label: classification
        });

        const { result } = renderHook(() => useClassificationAlert(mockData));

        expect(result.current).toEqual({
          severity: 'error',
          titleKey:
            'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.title',
          descriptionKey:
            'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.description'
        });
      });
    });
  });
});
