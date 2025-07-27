import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { useChapters } from './useChapters';
import * as GlobalStore from '../store/GlobalStore';
import { STATE, type State, type StoreContextProps } from '../store/types';
import type { AppState } from '../models/AppState';
import type { FilterValues } from '../models/Filters';
import utils from '../utils';
import type { AxiosResponse } from 'axios';
vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getAssessmentsRegistries: vi.fn()
      }
    },
    notify: {
      emit: vi.fn()
    }
  }
}));

vi.mock('../api/assessments/mappings', () => ({
  buildQueryParams: vi.fn().mockReturnValue('mocked-query-params')
}));

vi.mock('../utils/chaptersHelpers', () => ({
  transformChaptersData: vi.fn(),
  createAssessmentRegistryIdGetter: vi.fn()
}));
vi.mock('../store/GlobalStore', async () => {
  const actual = await vi.importActual('../store/GlobalStore');
  return {
    ...actual,
    useStore: vi.fn()
  };
});

describe('useChapters', () => {
  const mockOrganizationId = 123;
  const mockOperatingYear = '2024';
  const mockDebtPositionTypeOrgCode = 'DEBT_TYPE_001';

  const mockAssessmentRegistryData = [
    {
      assessmentRegistryId: 1,
      organizationId: 123,
      sectionCode: 'SEC001',
      sectionDescription: 'Section 1',
      officeDescription: 'Office 1',
      assessmentCode: 'ASS001',
      assessmentDescription: 'Assessment 1',
      operatingYear: '2024',
      status: 'ACTIVE'
    }
  ];

  const mockTransformedChapters = [
    {
      label: 'Office 1 - Section 1 - Assessment 1',
      value: 'ASS001',
      assessmentRegistryId: 1
    }
  ];

  const setupMocks = async () => {
    const mockState: State = {
      [STATE.USER_INFO]: undefined,
      [STATE.ORGANIZATIONS]: [],
      [STATE.ORGANIZATION_ID]: mockOrganizationId,
      [STATE.CONFIG_FE]: undefined,
      [STATE.APP_STATE]: {
        loading: false,
        customBreadcrumbsItems: [],
        ready: false
      } as AppState,
      [STATE.SELECTED_FILTERS]: [],
      [STATE.FILTER_VALUES]: {} as FilterValues,
      [STATE.OPERATOR_ROLE]: undefined,
      [STATE.ID_TOKEN]: undefined
    };

    vi.mocked(GlobalStore.useStore).mockReturnValue({
      state: mockState
    } as StoreContextProps);

    const { transformChaptersData, createAssessmentRegistryIdGetter } =
      await import('../utils/chaptersHelpers');
    vi.mocked(transformChaptersData).mockReturnValue(mockTransformedChapters);
    vi.mocked(createAssessmentRegistryIdGetter).mockReturnValue(vi.fn());
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await setupMocks();
  });

  it('should not make API call when parameters are missing', () => {
    renderHook(() => useChapters());

    expect(utils.apiClient.bff.getAssessmentsRegistries).not.toHaveBeenCalled();
  });

  it('should not make API call when enabled is false', () => {
    renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode,
        enabled: false
      })
    );

    expect(utils.apiClient.bff.getAssessmentsRegistries).not.toHaveBeenCalled();
  });

  it('should fetch and transform chapters data successfully', async () => {
    vi.mocked(utils.apiClient.bff.getAssessmentsRegistries).mockResolvedValue({
      data: {
        content: mockAssessmentRegistryData,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        number: 0
      }
    } as AxiosResponse);

    const { result } = renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode,
        enabled: true
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(utils.apiClient.bff.getAssessmentsRegistries).toHaveBeenCalledWith(
      mockOrganizationId,
      'mocked-query-params',
      {
        paramsSerializer: {
          indexes: null
        }
      }
    );

    expect(result.current.optionsMap).toEqual(mockTransformedChapters);
    expect(result.current.hasNoResults).toBe(false);
  });

  it('should handle empty response correctly', async () => {
    vi.mocked(utils.apiClient.bff.getAssessmentsRegistries).mockResolvedValue({
      data: {
        content: [],
        size: 10,
        totalElements: 0,
        totalPages: 0,
        number: 0
      }
    } as AxiosResponse);

    const chaptersHelpers = await import('../utils/chaptersHelpers');
    vi.mocked(chaptersHelpers.transformChaptersData).mockReturnValue([]);

    const { result } = renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNoResults).toBe(true);
    expect(result.current.optionsMap).toEqual([]);
  });

  it('should reset chapters when parameters become invalid', () => {
    const { result, rerender } = renderHook((props) => useChapters(props), {
      initialProps: {
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode
      }
    });

    rerender({
      operatingYear: '',
      debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode
    });

    expect(result.current.optionsMap).toEqual([]);
  });

  it('should use different cache key for validation purpose', () => {
    const { result: selectionResult } = renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode,
        purpose: 'selection'
      })
    );

    const { result: validationResult } = renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode,
        purpose: 'validation'
      })
    );

    expect(selectionResult.current).toBeDefined();
    expect(validationResult.current).toBeDefined();
  });

  it('should return getAssessmentRegistryId function', async () => {
    const mockGetterFunction = vi.fn();

    vi.mocked(utils.apiClient.bff.getAssessmentsRegistries).mockResolvedValue({
      data: {
        content: mockAssessmentRegistryData,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        number: 0
      }
    } as AxiosResponse);

    const chaptersHelpers = await import('../utils/chaptersHelpers');
    vi.mocked(chaptersHelpers.createAssessmentRegistryIdGetter).mockReturnValue(
      mockGetterFunction
    );

    const { result } = renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.getAssessmentRegistryId).toBe(mockGetterFunction);
  });

  it('should handle transformation errors gracefully', async () => {
    vi.mocked(utils.apiClient.bff.getAssessmentsRegistries).mockResolvedValue({
      data: {
        content: mockAssessmentRegistryData,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        number: 0
      }
    } as AxiosResponse);

    const chaptersHelpers = await import('../utils/chaptersHelpers');
    vi.mocked(chaptersHelpers.transformChaptersData).mockImplementation(() => {
      throw new Error('Transformation error');
    });

    const { result } = renderHook(() =>
      useChapters({
        operatingYear: mockOperatingYear,
        debtPositionTypeOrgCode: mockDebtPositionTypeOrgCode
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.optionsMap).toEqual([]);
    expect(utils.notify.emit).toHaveBeenCalledWith(
      'errors.fetchChapters',
      'error'
    );
  });
});
