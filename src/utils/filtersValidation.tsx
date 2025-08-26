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
  const values = Object.values(filters);
  if (!values || !Array.isArray(values) || values.length === 0) return true;

  // All Dates must be valid if present
  const dateFilters = values.filter(isDateFilter);
  if (dateFilters?.length) {
    return !dateFilters.every(isValidDateFilter);
  }

  const someFilterIsValid = values
    .filter((value) => typeof value !== 'object')
    .some((value) => (typeof value === 'string' ? !!value.trim() : !!value));

  return !someFilterIsValid;
};

export default { noFilterSetted };
