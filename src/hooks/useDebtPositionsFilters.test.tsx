import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { SearchType } from '../models/DebtPositiosn';
import { getDebtPositionsTypes } from '../api/debtPositions';
import useDebtPositionFilters from './useDebtPositionsFilters';
import { ButtonField, SelectField } from '../components/FilterContainer/FilterContainer';

vi.mock('../api/debtPositions', () => ({
  getDebtPositionsTypes: vi.fn()
}));

describe('useDebtPositionFilters', () => {
  const mockOnFilter = vi.fn();
  const mockDebtPositionTypes = {
    isSuccess: true,
    data: {
      data: {
        content: [
          { description: 'Type A', debtPositionTypeId: 1 },
          { description: 'Type B', debtPositionTypeId: 2 }
        ]
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and map debt position types', async () => {
    (getDebtPositionsTypes as Mock).mockReturnValue(mockDebtPositionTypes);

    const { result } = renderHook(() =>
      useDebtPositionFilters({ searchType: SearchType.DEBT_POSITION, onFilter: mockOnFilter })
    );

    await waitFor(() => {
      expect(result.current.filters).toBeDefined();
      expect(result.current.filters).toHaveLength(5);

      const dueTypeFilter = result.current.filters.find((f) => f.id === 'duetype') as SelectField;
      expect(dueTypeFilter?.options).toEqual([
        { label: 'Type A', value: 1 },
        { label: 'Type B', value: 2 },
        { label: 'Tutti', value: 'TUTTI' }
      ]);
    });
  });

  it('should return the correct filters for DEBT_POSITION search type', () => {
    (getDebtPositionsTypes as Mock).mockReturnValue(mockDebtPositionTypes);

    const { result } = renderHook(() =>
      useDebtPositionFilters({ searchType: SearchType.DEBT_POSITION, onFilter: mockOnFilter })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual(['fiscalCode', 'dateRange', 'status', 'duetype', 'applyFilters']);
  });

  it('should return the correct filters for IUV search type', () => {
    (getDebtPositionsTypes as Mock).mockReturnValue(mockDebtPositionTypes);

    const { result } = renderHook(() =>
      useDebtPositionFilters({ searchType: SearchType.IUV, onFilter: mockOnFilter })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual(['iuv', 'fiscalCode', 'dateRange', 'duetype', 'applyFilters']);
  });

  it('should call onFilter when the apply button is clicked', () => {
    (getDebtPositionsTypes as Mock).mockReturnValue(mockDebtPositionTypes);

    const { result } = renderHook(() =>
      useDebtPositionFilters({ searchType: SearchType.DEBT_POSITION, onFilter: mockOnFilter })
    );

    const applyButton = result.current.filters.find((f) => f.id === 'applyFilters') as ButtonField;

    expect(applyButton?.onClick).toBeDefined();
  });
});
