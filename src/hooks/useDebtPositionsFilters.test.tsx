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
        searchType: SearchType.DEBT_POSITION
      })
    );

    await waitFor(() => {
      expect(result.current.filters).toBeDefined();
      // DEBT_POSITION type should yield 6 filters
      expect(result.current.filters).toHaveLength(6);
    });

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual([
      'iuv',
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
        searchType: SearchType.IUV
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

  it('should return button without onClick handler', () => {
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
        searchType: SearchType.DEBT_POSITION
      })
    );

    // Find the applyFilters button filter (which should be of type ButtonField)
    const applyButton = result.current.filters.find(
      (f) => f.id === 'applyFilters'
    ) as ButtonField;

    expect(applyButton).toBeDefined();
    expect(applyButton?.id).toBe('applyFilters');
    expect(applyButton?.onClick).toBeUndefined();
  });
});
