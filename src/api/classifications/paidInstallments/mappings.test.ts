import { describe, it, expect, vi, afterEach } from 'vitest';
import { subDays } from 'date-fns';
import { buildQueryParams, convertFiltersToAPI } from './mappings';
import type { PaymentsUIFilters } from './mappings';
import {
  date as dateFormatter,
  toStartOfDay,
  toEndOfDay
} from '../../../utils/formatters';

describe('paidInstallments mappings', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('buildQueryParams', () => {
    it('should include every optional field when provided', () => {
      const result = buildQueryParams({
        debtPositionTypeOrgCode: 'CODE',
        assessmentId: 123,
        filters: {
          iuv: 'IUV',
          paymentDateTimeFrom: 'from',
          paymentDateTimeTo: 'to',
          updateDateFrom: 'uFrom',
          updateDateTo: 'uTo'
        },
        pagination: { page: 2, size: 50 },
        sort: ['paymentDateTime,desc']
      });

      expect(result).toEqual({
        debtPositionTypeOrgCode: 'CODE',
        assessmentId: 123,
        iuv: 'IUV',
        paymentDateTimeFrom: 'from',
        paymentDateTimeTo: 'to',
        updateDateFrom: 'uFrom',
        updateDateTo: 'uTo',
        page: 2,
        size: 50,
        sort: ['paymentDateTime,desc']
      });
    });

    it('should omit optional fields when missing', () => {
      const result = buildQueryParams({
        debtPositionTypeOrgCode: 'CODE',
        pagination: { page: 0, size: 10 }
      });

      expect(result).toEqual({
        debtPositionTypeOrgCode: 'CODE',
        page: 0,
        size: 10
      });
      expect(result).not.toHaveProperty('assessmentId');
      expect(result).not.toHaveProperty('iuv');
      expect(result).not.toHaveProperty('sort');
    });

    it('should omit assessmentId when it is falsy', () => {
      const result = buildQueryParams({
        debtPositionTypeOrgCode: 'CODE',
        assessmentId: 0,
        pagination: { page: 0, size: 10 }
      });

      expect(result).not.toHaveProperty('assessmentId');
    });

    it('should omit sort when the array is empty', () => {
      const result = buildQueryParams({
        debtPositionTypeOrgCode: 'CODE',
        pagination: { page: 0, size: 10 },
        sort: []
      });

      expect(result).not.toHaveProperty('sort');
    });
  });

  describe('convertFiltersToAPI', () => {
    const from = new Date('2023-01-01T10:00:00Z');
    const to = new Date('2023-01-31T10:00:00Z');

    it('should map iuv and date ranges when provided', () => {
      const uiFilters: PaymentsUIFilters = {
        iuv: '  IUV-1  ',
        dateFrom: from,
        dateTo: to,
        updateDateFrom: from,
        updateDateTo: to
      };

      const result = convertFiltersToAPI(uiFilters);

      expect(result).toEqual({
        iuv: 'IUV-1',
        paymentDateTimeFrom: dateFormatter.code(from),
        paymentDateTimeTo: dateFormatter.code(to),
        updateDateFrom: dateFormatter.code(from),
        updateDateTo: dateFormatter.code(to)
      });
    });

    it('should ignore blank iuv', () => {
      const result = convertFiltersToAPI({
        iuv: '   ',
        dateFrom: from,
        dateTo: to
      });

      expect(result).not.toHaveProperty('iuv');
    });

    it('should not map a partial date range and fall back to defaults', () => {
      vi.useFakeTimers();
      const today = new Date('2024-06-15T12:00:00Z');
      vi.setSystemTime(today);

      const result = convertFiltersToAPI({
        dateFrom: from,
        updateDateFrom: from
      });

      expect(result).not.toHaveProperty('updateDateFrom');
      expect(result).not.toHaveProperty('updateDateTo');
      expect(result.paymentDateTimeFrom).toBe(
        dateFormatter.code(toStartOfDay(subDays(today, 30)))
      );
      expect(result.paymentDateTimeTo).toBe(
        dateFormatter.code(toEndOfDay(today))
      );
    });

    it('should add a default 30-day range when no payment date range is present', () => {
      vi.useFakeTimers();
      const today = new Date('2024-06-15T12:00:00Z');
      vi.setSystemTime(today);

      const result = convertFiltersToAPI({});

      const expectedFrom = dateFormatter.code(toStartOfDay(subDays(today, 30)));
      const expectedTo = dateFormatter.code(toEndOfDay(today));

      expect(result.paymentDateTimeFrom).toBe(expectedFrom);
      expect(result.paymentDateTimeTo).toBe(expectedTo);
      expect(result).not.toHaveProperty('iuv');
    });

    it('should add default dates when only update date range is provided', () => {
      vi.useFakeTimers();
      const today = new Date('2024-06-15T12:00:00Z');
      vi.setSystemTime(today);

      const result = convertFiltersToAPI({
        updateDateFrom: from,
        updateDateTo: to
      });

      expect(result.updateDateFrom).toBe(dateFormatter.code(from));
      expect(result.updateDateTo).toBe(dateFormatter.code(to));
      expect(result.paymentDateTimeFrom).toBe(
        dateFormatter.code(toStartOfDay(subDays(today, 30)))
      );
      expect(result.paymentDateTimeTo).toBe(
        dateFormatter.code(toEndOfDay(today))
      );
    });

    it('should not add default dates when a payment date range is present', () => {
      const result = convertFiltersToAPI({
        dateFrom: from,
        dateTo: to
      });

      expect(result.paymentDateTimeFrom).toBe(dateFormatter.code(from));
      expect(result.paymentDateTimeTo).toBe(dateFormatter.code(to));
    });
  });
});
