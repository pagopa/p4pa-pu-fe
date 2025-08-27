import { BaseFilterValues, FilterFieldValue } from '../models/Filters';

/**
 * Validates a date filter object ensuring both 'from' and 'to' are truthy if either is set.
 */
const isValidDateFilter = (value: FilterFieldValue): boolean => {
  if (typeof value !== 'object' || value === null) return false;

  if ('from' in value && 'to' in value) {
    const hasFrom = Boolean(value.from);
    const hasTo = Boolean(value.to);

    return hasFrom && hasTo;
  }

  return false;
};

const isDateFilter = (value: FilterFieldValue): boolean => {
  if (typeof value !== 'object' || value === null) return false;

  return 'from' in value || 'to' in value;
};

/**
 * Checks if filters object has no meaningful filters set,
 * including date filters with complete 'from' and 'to' fields.
 */
export const noFilterSetted = (filters: BaseFilterValues): boolean => {
  if (!filters || typeof filters !== 'object') return true;

  const entries = Object.entries(filters);
  if (entries.length === 0) return true;

  const hasInvalidDateRange = entries.some(([key, value]) => {
    if (key.endsWith('_fromError') || key.endsWith('_toError')) {
      return false;
    }

    if (isDateFilter(value)) {
      const dateRange = value as { from?: Date | null; to?: Date | null };
      const hasFrom = Boolean(dateRange.from);
      const hasTo = Boolean(dateRange.to);

      return (hasFrom && !hasTo) || (!hasFrom && hasTo);
    }

    return false;
  });

  if (hasInvalidDateRange) {
    return true;
  }

  return !entries.some(([key, value]) => {
    if (key.endsWith('_fromError') || key.endsWith('_toError')) {
      return false;
    }

    if (isDateFilter(value)) {
      return isValidDateFilter(value);
    }

    if (typeof value === 'string') {
      return !!value.trim();
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (value instanceof Date) {
      return true;
    }

    return value != null;
  });
};

export default { noFilterSetted };
