import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useTelematicReceiptsFilters from './useTelematicReceiptsFilters';
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

describe('useTelematicReceiptsFilters', () => {
  const mockOnFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct filters ', () => {
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
      useTelematicReceiptsFilters({
        onFilter: mockOnFilter
      })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual([
      'iuv',
      'typeOrgId',
      'dateRange',
      'applyFilters'
    ]);
  });

  it('should not include apply button in "grid" layout', () => {
    const { result } = renderHook(() =>
      useTelematicReceiptsFilters({
        onFilter: mockOnFilter,
        layout: 'grid'
      })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual(['iuv', 'typeOrgId', 'dateRange']);
    expect(filterIds.includes('applyFilters')).toBe(false);
  });
});
