import { BaseFilterValues } from '../models/Filters';

type FilterValues = BaseFilterValues;

/**
 * Checks if ad object filters contains non empty filters
 * @param filters - Object with filters
 * @returns true if there is at least one filter filled
 */
export const noFilterSetted = (filters: FilterValues) => {
  const listEntries = Object.values(filters);

  const filtersHaveAtLeastADateFilterCorrectlyValued = listEntries.some(
    (el) => {
      return el instanceof Object
        ? 'from' in el && el.from !== null && 'to' in el && el.to !== null
        : false;
    }
  );

  // false when at least one filter is setted
  const otherFiltersAreAllEmpty = listEntries
    .filter((el) => !(el instanceof Object))
    .every((el) => (typeof el === 'string' ? el.trim() === '' : !el));

  return (
    !Array.isArray(listEntries) ||
    listEntries.length === 0 ||
    (otherFiltersAreAllEmpty && !filtersHaveAtLeastADateFilterCorrectlyValued)
  );
};

export default { noFilterSetted };
