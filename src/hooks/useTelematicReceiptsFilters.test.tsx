import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useTelematicReceiptsFilters from './useTelematicReceiptsFilters';
import { ButtonField } from '../components/FilterContainer/FilterContainer';
import { getDebtPositionsTypes } from '../api/debtPositionsTypes';

vi.mock('../api/debtPositionsTypes', () => ({
  getDebtPositionsTypes: vi.fn()
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

describe('useTelematicReceiptsFilters', () => {
  const mockOnFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct filters ', () => {
    (getDebtPositionsTypes as unknown as Mock).mockReturnValue({
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

  it('should call onFilter when the apply button is triggered', () => {
    (getDebtPositionsTypes as unknown as Mock).mockReturnValue({
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
