import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClientSilFilters } from './useClientSilFilters';
import { COMPONENT_TYPE } from '../components/FilterContainer/FilterContainer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('@mui/icons-material/Search', () => ({
  default: () => 'SearchIcon'
}));

describe('useClientSilFilters', () => {
  const mockOnFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct filter configuration', () => {
    const { result } = renderHook(() =>
      useClientSilFilters({ onFilter: mockOnFilter })
    );

    const filters = result.current.filters;

    expect(filters).toHaveLength(3);

    expect(filters[0]).toMatchObject({
      type: COMPONENT_TYPE.textField,
      label: 'clientSil.filters.clientName',
      placeholder: 'clientSil.filters.clientNamePlaceholder',
      gridWidth: 5,
      id: 'clientName'
    });

    expect(filters[1]).toMatchObject({
      type: COMPONENT_TYPE.textField,
      label: 'clientSil.filters.clientId',
      placeholder: 'clientSil.filters.clientIdPlaceholder',
      gridWidth: 5,
      id: 'clientId'
    });

    expect(filters[2]).toMatchObject({
      type: COMPONENT_TYPE.button,
      label: 'commons.filters.filterResults',
      gridWidth: 2,
      id: 'applyFilters'
    });

    if (filters[2].type === COMPONENT_TYPE.button) {
      expect(filters[2].onClick).toBe(mockOnFilter);
    }
  });

  it('should use correct translation keys', () => {
    const { result } = renderHook(() =>
      useClientSilFilters({ onFilter: mockOnFilter })
    );

    const filters = result.current.filters;

    expect(filters[0].label).toBe('clientSil.filters.clientName');
    if (filters[0].type === COMPONENT_TYPE.textField) {
      expect(filters[0].placeholder).toBe(
        'clientSil.filters.clientNamePlaceholder'
      );
    }

    expect(filters[1].label).toBe('clientSil.filters.clientId');
    if (filters[1].type === COMPONENT_TYPE.textField) {
      expect(filters[1].placeholder).toBe(
        'clientSil.filters.clientIdPlaceholder'
      );
    }

    expect(filters[2].label).toBe('commons.filters.filterResults');
  });

  it('should pass onFilter callback to button', () => {
    const { result } = renderHook(() =>
      useClientSilFilters({ onFilter: mockOnFilter })
    );

    const filterButton = result.current.filters.find(
      (filter) => filter.id === 'applyFilters'
    );

    expect(filterButton).toBeDefined();
    expect(filterButton?.type).toBe(COMPONENT_TYPE.button);

    if (filterButton?.type === COMPONENT_TYPE.button) {
      expect(filterButton.onClick).toBe(mockOnFilter);
    }
  });
});
