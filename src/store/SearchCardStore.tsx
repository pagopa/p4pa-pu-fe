import { signal } from '@preact/signals-react';

export interface DateRangeValue {
  from: Date | null;
  to: Date | null;
}

export interface BaseFilterValues {
  [key: string]: string | number | boolean | DateRangeValue | null | undefined;
}

export interface IUVFilterValues extends BaseFilterValues {
  searchIUVDescription?: string;
  searchfiscalcodedescription?: string;
  daterange?: DateRangeValue;
  duetype?: string;
}

export interface DebtPositionFilterValues extends BaseFilterValues {
  searchfiscalcodedescription?: string;
  daterange?: DateRangeValue;
  duetype?: string;
  state?: string;
}

export const iuvFilterValues = signal<IUVFilterValues>({});
export const debtPositionFilterValues = signal<DebtPositionFilterValues>({});

export const activeTabIndex = signal<number>(0);

export type SearchType = 'IUV' | 'DEBT_POSITION';

export function getActiveFilterSignal() {
  return activeTabIndex.value === 0 ? iuvFilterValues : debtPositionFilterValues;
}

export function getFilterValuesBySearchType(searchType: SearchType) {
  return searchType === 'IUV' ? iuvFilterValues : debtPositionFilterValues;
}

export function resetFilters(tabIndex?: number) {
  if (tabIndex === undefined || tabIndex === 0) {
    iuvFilterValues.value = {};
  }
  if (tabIndex === undefined || tabIndex === 1) {
    debtPositionFilterValues.value = {};
  }
}

export function updateFilterField<K extends keyof (IUVFilterValues & DebtPositionFilterValues)>(
  field: K,
  value: (IUVFilterValues & DebtPositionFilterValues)[K]
) {
  const signal = getActiveFilterSignal();
  signal.value = {
    ...signal.value,
    [field]: value
  };
}
