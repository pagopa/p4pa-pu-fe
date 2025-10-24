/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import { useReceiptDetail } from './useReceiptDetail';
import { getReceiptDetail } from '../api/receiptDetail';
import notify from '../utils/notify';

vi.mock('../api/receiptDetail', () => ({
  getReceiptDetail: vi.fn()
}));

vi.mock('../utils/notify', () => ({
  default: {
    emit: vi.fn()
  }
}));

describe('useReceiptDetail', () => {
  const mockOrganizationId = 123;
  const mockReceiptId = 456;
  const mockGetReceiptDetail = vi.mocked(getReceiptDetail);

  const mockReceiptData = {
    iuv: 'IUV123456789',
    paymentAmountCents: 10000,
    remittanceInformation: 'Payment for services',
    debtPositionTypeOrgDescription: 'Type A',
    debtor: {
      fullName: 'John Doe',
      fiscalCode: 'JDOE80A01H501X',
      entityType: 'F' as const
    },
    paymentDateTime: '2025-01-15T10:30:00Z',
    pspCompanyName: 'Test PSP Company',
    iud: 'IUD987654321',
    iur: 'IUR111222333'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty arrays when data is not available', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    expect(result.current.summaryData).toEqual([]);
    expect(result.current.paymentData).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('calls getReceiptDetail with correct parameters', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    renderHook(() => useReceiptDetail(mockOrganizationId, mockReceiptId));

    expect(mockGetReceiptDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      mockReceiptId
    );
  });

  it('formats summary data correctly for person debtor', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    expect(result.current.summaryData).toEqual([
      { label: 'commons.iuv', value: 'IUV123456789' },
      { label: 'commons.amount', value: expect.stringContaining('100,00') },
      { label: 'commons.reason', value: 'Payment for services' },
      { label: 'commons.duetype', value: 'Type A' },
      { label: 'commons.debtor', value: 'John Doe' },
      {
        label: 'commons.fiscalCodeorVat',
        value: 'JDOE80A01H501X (commons.person)'
      }
    ]);
  });

  it('formats summary data correctly for company debtor', () => {
    const companyData = {
      ...mockReceiptData,
      debtor: {
        fullName: 'Acme Corp',
        fiscalCode: '12345678901',
        entityType: 'G' as const
      }
    };

    mockGetReceiptDetail.mockReturnValue({
      data: companyData,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    const fiscalCodeField = result.current.summaryData.find(
      (item) => item.label === 'commons.fiscalCodeorVat'
    );

    expect(fiscalCodeField?.value).toBe('12345678901 ');
  });

  it('includes notificationFeeCents in summary when present', () => {
    const dataWithFee = {
      ...mockReceiptData,
      notificationFeeCents: 150
    };

    mockGetReceiptDetail.mockReturnValue({
      data: dataWithFee,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    expect(result.current.summaryData).toContainEqual({
      label: 'commons.notificationFeeCents',
      value: '150',
      valueType: 'amount'
    });
    expect(result.current.summaryData).toHaveLength(7);
  });

  it('excludes notificationFeeCents from summary when not present', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    const hasFeeField = result.current.summaryData.some(
      (item) => item.label === 'commons.notificationFeeCents'
    );

    expect(hasFeeField).toBe(false);
    expect(result.current.summaryData).toHaveLength(6);
  });

  it('formats payment data correctly', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    expect(result.current.paymentData).toEqual([
      {
        label: 'commons.paymentdate',
        value: '15/01/2025'
      },
      { label: 'commons.psp', value: 'Test PSP Company' },
      { label: 'commons.iud', value: 'IUD987654321' },
      { label: 'commons.iur', value: 'IUR111222333' }
    ]);
  });

  it('handles missing optional fields with fallback values', () => {
    const incompleteData = {
      iuv: null,
      paymentAmountCents: null,
      remittanceInformation: null,
      debtPositionTypeOrgDescription: null,
      debtor: {
        fullName: null,
        fiscalCode: null,
        entityType: 'F' as const
      },
      paymentDateTime: null,
      pspCompanyName: null,
      iud: null,
      iur: null
    };

    mockGetReceiptDetail.mockReturnValue({
      data: incompleteData,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    // Check summary data has fallback values
    expect(result.current.summaryData[0].value).toBe('-');
    expect(result.current.summaryData[2].value).toBe('-');

    // Check payment data has fallback values
    expect(result.current.paymentData[0].value).toBe('-');
    expect(result.current.paymentData[1].value).toBe('-');
  });

  it('returns loading state correctly', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('returns error state correctly and emits notification', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    expect(result.current.isError).toBe(true);
    expect(notify.emit).toHaveBeenCalledWith('commons.genericError');
  });

  it('memoizes summaryData correctly', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result, rerender } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    const firstSummaryData = result.current.summaryData;

    // Rerender without changing data
    rerender();

    expect(result.current.summaryData).toBe(firstSummaryData);
  });

  it('memoizes paymentData correctly', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result, rerender } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    const firstPaymentData = result.current.paymentData;

    // Rerender without changing data
    rerender();

    expect(result.current.paymentData).toBe(firstPaymentData);
  });

  it('recalculates memoized data when receipt data changes', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result, rerender } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    const firstSummaryData = result.current.summaryData;

    // Change the mock data
    const updatedData = {
      ...mockReceiptData,
      iuv: 'UPDATED_IUV'
    };

    mockGetReceiptDetail.mockReturnValue({
      data: updatedData,
      isLoading: false,
      isError: false
    } as any);

    rerender();

    expect(result.current.summaryData).not.toBe(firstSummaryData);
    expect(result.current.summaryData[0].value).toBe('UPDATED_IUV');
  });

  it('formats date in Italian locale', () => {
    mockGetReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    } as any);

    const { result } = renderHook(() =>
      useReceiptDetail(mockOrganizationId, mockReceiptId)
    );

    const dateField = result.current.paymentData[0];
    expect(dateField.value).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
