import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { SearchType } from '../models/DebtPositions';
import useDebtPositionFilters from './useDebtPositionsFilters';
import {
  ButtonField,
  SelectField
} from '../components/FilterContainer/FilterContainer';
import { getDebtPositionTypeOrgs } from '../api/debtPositionsTypeOrg';

vi.mock('../api/debtPositionsTypeOrg', () => ({
  getDebtPositionTypeOrgs: vi.fn()
}));

vi.mock('./useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: () => ({
    optionsMap: [
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 }
    ]
  })
}));

describe('useDebtPositionFilters', () => {
  const mockOnFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct filters for DEBT_POSITION search type', async () => {
    (getDebtPositionTypeOrgs as unknown as Mock).mockReturnValue({
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
      'typeOrgId',
      'applyFilters'
    ]);

    // Check that the 'typeOrgId' filter uses the optionsMap from the mocked hook
    const typeOrgIdFilter = result.current.filters.find(
      (f) => f.id === 'typeOrgId'
    ) as SelectField;
    expect(typeOrgIdFilter.options).toEqual([
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 }
    ]);
  });

  it('should return correct filters for IUV search type', () => {
    (getDebtPositionTypeOrgs as unknown as Mock).mockReturnValue({
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
      'typeOrgId',
      'applyFilters'
    ]);
  });

  it('should call onFilter when the apply button is triggered', () => {
    (getDebtPositionTypeOrgs as unknown as Mock).mockReturnValue({
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
