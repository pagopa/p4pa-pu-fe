import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { SearchType } from '../models/DebtPositiosn';
import useDebtPositionFilters from './useDebtPositionsFilters';
import {
  ButtonField,
  SelectField
} from '../components/FilterContainer/FilterContainer';
import debtPositions from '../api/debtPositions';

vi.mock('../api/debtPositions', () => ({
  default: {
    getDebtPositionsTypes: vi.fn()
  }
}));

vi.mock('./useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: () => ({
    optionsMap: [
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 },
      { label: 'Tutti', value: 'TUTTI' }
    ]
  })
}));

describe('useDebtPositionFilters', () => {
  const mockOnFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct filters for DEBT_POSITION search type', async () => {
    (debtPositions.getDebtPositionsTypes as unknown as Mock).mockReturnValue({
      isSuccess: true,
      data: {
        data: {
          content: [
            { description: 'Type A', debtPositionTypeId: 1 },
            { description: 'Type B', debtPositionTypeId: 2 }
          ]
        }
      }
    });

    const { result } = renderHook(() =>
      useDebtPositionFilters({
        searchType: SearchType.DEBT_POSITION,
        onFilter: mockOnFilter
      })
    );

    await waitFor(() => {
      expect(result.current.filters).toBeDefined();
      // DEBT_POSITION type should yield 5 filters
      expect(result.current.filters).toHaveLength(5);
    });

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual([
      'fiscalCode',
      'dateRange',
      'status',
      'duetype',
      'applyFilters'
    ]);

    // Check that the 'duetype' filter uses the optionsMap from the mocked hook
    const duetypeFilter = result.current.filters.find(
      (f) => f.id === 'duetype'
    ) as SelectField;
    expect(duetypeFilter.options).toEqual([
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 },
      { label: 'Tutti', value: 'TUTTI' }
    ]);
  });

  it('should return correct filters for IUV search type', () => {
    (debtPositions.getDebtPositionsTypes as unknown as Mock).mockReturnValue({
      isSuccess: true,
      data: {
        data: {
          content: [
            { description: 'Type A', debtPositionTypeId: 1 },
            { description: 'Type B', debtPositionTypeId: 2 }
          ]
        }
      }
    });

    const { result } = renderHook(() =>
      useDebtPositionFilters({
        searchType: SearchType.IUV,
        onFilter: mockOnFilter
      })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual([
      'iuv',
      'fiscalCode',
      'dateRange',
      'duetype',
      'applyFilters'
    ]);
  });

  it('should call onFilter when the apply button is triggered', () => {
    (debtPositions.getDebtPositionsTypes as unknown as Mock).mockReturnValue({
      isSuccess: true,
      data: {
        data: {
          content: [
            { description: 'Type A', debtPositionTypeId: 1 },
            { description: 'Type B', debtPositionTypeId: 2 }
          ]
        }
      }
    });

    const { result } = renderHook(() =>
      useDebtPositionFilters({
        searchType: SearchType.DEBT_POSITION,
        onFilter: mockOnFilter
      })
    );

    // Find the applyFilters button filter (which should be of type ButtonField)
    const applyButton = result.current.filters.find(
      (f) => f.id === 'applyFilters'
    ) as ButtonField;
    expect(applyButton?.onClick).toBeDefined();

    if (applyButton?.onClick) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applyButton.onClick({} as any);
      expect(mockOnFilter).toHaveBeenCalled();
    }
  });
});
