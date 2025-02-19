import { signal } from '@preact/signals-react';

export const filtersState = signal<string[]>(['']);

export function setFiltersState(newState: string[]) {
  filtersState.value = newState;
}

export const addFilterRow = (nextId?: string) => {
  const filters = filtersState.value;
  setFiltersState([...filters, nextId ?? '']);
};

export const removeFilterRow = (id: string) => {
  const filters = filtersState.value;
  if (filters.length > 1) {
    setFiltersState(filters.filter((filterId) => filterId !== id));
  }
};

export const updateFilter = (id: string, index: number) => {
  const filters = [...filtersState.value];
  filters[index] = id;
  setFiltersState(filters);
};

export const removeAllFilters = () => {
  setFiltersState(['']);
};
