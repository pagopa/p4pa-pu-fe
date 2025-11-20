import { BaseFilterValues, FilterFieldValue } from '../models/Filters';

/**
 * Helper function to check if a Date value is valid (not null, not undefined, and not Invalid Date)
 */
const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validates a date filter object ensuring both 'from' and 'to' are truthy if either is set.
 * Also validates that Date values are not Invalid Date.
 */
const isValidDateFilter = (value: FilterFieldValue): boolean => {
  if (typeof value !== 'object' || value === null) return false;

  if ('from' in value && 'to' in value) {
    const hasFrom = isValidDate(value.from);
    const hasTo = isValidDate(value.to);

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

  const rawFilters: BaseFilterValues = {
    ...filters,
    page: null,
    size: null,
    sort: null,
    sortDirection: null,
    sortField: null
  };

  const entries = Object.entries(rawFilters);
  if (entries.length === 0) return true;

  const hasInvalidDateRange = entries.some(([key, value]) => {
    if (key.endsWith('_fromError') || key.endsWith('_toError')) {
      return false;
    }

    if (isDateFilter(value)) {
      const dateRange = value as { from?: Date | null; to?: Date | null };
      const hasFrom = isValidDate(dateRange.from);
      const hasTo = isValidDate(dateRange.to);

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

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (value instanceof Date) {
      return isValidDate(value);
    }

    return value != null;
  });
};

export const canPerformSearch = (filters: BaseFilterValues): boolean => {
  return !noFilterSetted(filters);
};

/**
 * Checks if there are partial date range errors (e.g., only 'from' or only 'to').
 * Returns true whenever there are partial date ranges, regardless of other filters.
 */
export const hasPartialDateRangeErrors = (
  filters: BaseFilterValues
): boolean => {
  if (!filters || typeof filters !== 'object') return false;

  const entries = Object.entries(filters);
  if (entries.length === 0) return false;

  const hasPartialDateRange = entries.some(([key, value]) => {
    if (key.endsWith('_fromError') || key.endsWith('_toError')) {
      return false;
    }

    if (isDateFilter(value)) {
      const dateRange = value as { from?: Date | null; to?: Date | null };
      const hasFrom = isValidDate(dateRange.from);
      const hasTo = isValidDate(dateRange.to);

      return (hasFrom && !hasTo) || (!hasFrom && hasTo);
    }

    return false;
  });

  return hasPartialDateRange;
};

/**
 * Determines whether to display the general ErrorMessage.
 * Does not show the error if there are partial issues with date ranges,
 * which are already visually handled by the individual components.
 */
export const shouldShowGeneralError = (filters: BaseFilterValues): boolean => {
  const noFilters = noFilterSetted(filters);
  const onlyPartialErrors = hasPartialDateRangeErrors(filters);

  return noFilters && !onlyPartialErrors;
};

export default {
  noFilterSetted,
  canPerformSearch,
  hasPartialDateRangeErrors,
  shouldShowGeneralError
};
