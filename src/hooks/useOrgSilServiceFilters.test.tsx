import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOrgSilServiceFilters } from './useOrgSilServiceFilters';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';

type ButtonFilterItem = Extract<FilterItem, { type: COMPONENT_TYPE.button }>;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('useOrgSilServiceFilters', () => {
  it('should return the correct filter configuration', () => {
    const { result } = renderHook(() => useOrgSilServiceFilters());

    expect(result.current.filters).toHaveLength(2);

    const textField = result.current.filters[0];
    expect(textField.id).toBe('applicationName');
    expect(textField.label).toBe('orgSilService.apiName');

    const button = result.current.filters[1] as ButtonFilterItem;

    expect(button.id).toBe('applyFilters');
    expect(button.label).toBe('commons.search');
    expect(button.onClick).toBeUndefined();
  });
});
