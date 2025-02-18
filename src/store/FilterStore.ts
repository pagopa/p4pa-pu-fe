import { signal } from '@preact/signals-react';

export const MAX_FILTERS = 10;

export const filtersState = signal([0]);

export function setFiltersState(newState: number[]) {
  filtersState.value = newState;
}

export const addFilterRow = () => {
  const filters = filtersState.value;
  if (filters.length < MAX_FILTERS) {
    const nextId = filters.length ? Math.max(...filters) + 1 : 0;
    setFiltersState([...filters, nextId]);
  }
};

export const removeFilterRow = (id: number) => {
  const filters = filtersState.value;
  if (filters.length > 1) {
    setFiltersState(filters.filter((filterId) => filterId !== id));
  }
};

export const removeAllFilters = () => {
  setFiltersState([0]);
};
