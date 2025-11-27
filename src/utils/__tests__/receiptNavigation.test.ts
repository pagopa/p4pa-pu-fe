import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildTelematicReceiptDetailPath,
  appendReceiptIudQuery
} from '../receiptNavigation';

const { mockGeneratePath } = vi.hoisted(() => {
  return {
    mockGeneratePath: vi.fn((path: string, params: Record<string, string>) => {
      let result = path;
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
      });
      return result;
    })
  };
});

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    generatePath: mockGeneratePath
  };
});

vi.mock('../routes', () => ({
  PageRoutes: {
    TELEMATIC_RECEIPT_DETAIL:
      '/piattaformaunitaria/flows/telematic-receipt/:receiptId'
  }
}));

describe('receiptNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('appendReceiptIudQuery', () => {
    it('should append iud query parameter when iud is provided', () => {
      const path = '/flows/telematic-receipt/123';
      const iud = 'IUD-ABC-123';

      const result = appendReceiptIudQuery(path, iud);

      expect(result).toBe('/flows/telematic-receipt/123?iud=IUD-ABC-123');
    });

    it('should not append query parameter when iud is undefined', () => {
      const path = '/flows/telematic-receipt/123';

      const result = appendReceiptIudQuery(path);

      expect(result).toBe('/flows/telematic-receipt/123');
    });

    it('should not append query parameter when iud is empty string', () => {
      const path = '/flows/telematic-receipt/123';

      const result = appendReceiptIudQuery(path, '');

      expect(result).toBe('/flows/telematic-receipt/123');
    });

    it('should handle paths with existing query parameters', () => {
      const path = '/flows/telematic-receipt/123?other=value';
      const iud = 'IUD-ABC-123';

      const result = appendReceiptIudQuery(path, iud);

      expect(result).toBe(
        '/flows/telematic-receipt/123?other=value?iud=IUD-ABC-123'
      );
    });

    it('should URL encode special characters in iud', () => {
      const path = '/flows/telematic-receipt/123';
      const iud = 'IUD with spaces & special chars';

      const result = appendReceiptIudQuery(path, iud);

      expect(result).toContain('iud=');
      expect(result).toContain('IUD+with+spaces+%26+special+chars');
    });
  });

  describe('buildTelematicReceiptDetailPath', () => {
    it('should build path with receiptId and iud when both are provided', () => {
      const receiptId = 123;
      const iud = 'IUD-ABC-123';

      const result = buildTelematicReceiptDetailPath(receiptId, iud);

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '123' }
      );
      expect(result).toBe(
        '/piattaformaunitaria/flows/telematic-receipt/123?iud=IUD-ABC-123'
      );
    });

    it('should build path with receiptId as string and iud', () => {
      const receiptId = '456';
      const iud = 'IUD-XYZ-789';

      const result = buildTelematicReceiptDetailPath(receiptId, iud);

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '456' }
      );
      expect(result).toBe(
        '/piattaformaunitaria/flows/telematic-receipt/456?iud=IUD-XYZ-789'
      );
    });

    it('should build path without iud query parameter when iud is not provided', () => {
      const receiptId = 789;

      const result = buildTelematicReceiptDetailPath(receiptId);

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '789' }
      );
      expect(result).toBe('/piattaformaunitaria/flows/telematic-receipt/789');
    });

    it('should build path without iud query parameter when iud is undefined', () => {
      const receiptId = 999;

      const result = buildTelematicReceiptDetailPath(receiptId);

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '999' }
      );
      expect(result).toBe('/piattaformaunitaria/flows/telematic-receipt/999');
    });

    it('should build path without iud query parameter when iud is empty string', () => {
      const receiptId = 111;

      const result = buildTelematicReceiptDetailPath(receiptId, '');

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '111' }
      );
      expect(result).toBe('/piattaformaunitaria/flows/telematic-receipt/111');
    });

    it('should handle receiptId as zero', () => {
      const receiptId = 0;
      const iud = 'IUD-ZERO';

      const result = buildTelematicReceiptDetailPath(receiptId, iud);

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '0' }
      );
      expect(result).toBe(
        '/piattaformaunitaria/flows/telematic-receipt/0?iud=IUD-ZERO'
      );
    });

    it('should handle large receiptId values', () => {
      const receiptId = 999999999;
      const iud = 'IUD-LARGE';

      const result = buildTelematicReceiptDetailPath(receiptId, iud);

      expect(mockGeneratePath).toHaveBeenCalledWith(
        '/piattaformaunitaria/flows/telematic-receipt/:receiptId',
        { receiptId: '999999999' }
      );
      expect(result).toBe(
        '/piattaformaunitaria/flows/telematic-receipt/999999999?iud=IUD-LARGE'
      );
    });
  });
});
