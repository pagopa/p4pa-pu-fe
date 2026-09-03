/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '../../../__tests__/renderers';
import { AxiosResponse } from 'axios';
import utils from '../../../utils';
import * as loaders from '../../../utils/loaders';
import { getAssessmentDetail } from './assessmentDetail';
import { assessmentsRowsDetailSchema } from '../../../../generated/core/zod-schema';
import { createMock } from 'zodock';

vi.mock('../../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getPagedAssessmentsDetails: vi.fn()
      }
    }
  }
}));

vi.mock('../../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

vi.mock('../mappings', () => ({
  buildAssessmentDetailQueryParams: (filters: any) => filters,
  AssessmentDetailFilters: {}
}));

const mockGetPagedAssessmentsDetails = vi.mocked(
  utils.apiClient.bff.getPagedAssessmentsDetails
);
const mockParseAndLog = vi.mocked(loaders.parseAndLog);

describe('getAssessmentDetail', () => {
  const organizationId = 123;
  const assessmentId = 456;
  const mockFilters = {
    filters: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    } as any,
    pagination: { page: 0, size: 10 },
    sort: []
  };

  const mockAssessmentDetail = createMock(assessmentsRowsDetailSchema);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API with correct parameters and return assessment detail', async () => {
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: mockAssessmentDetail
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    act(() => {
      result.current.mutate(mockFilters);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetPagedAssessmentsDetails).toHaveBeenCalledWith(
      organizationId,
      assessmentId,
      mockFilters
    );
    expect(result.current.data).toEqual(mockAssessmentDetail);
  });

  it('should call parseAndLog when assessment detail data is present', async () => {
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: mockAssessmentDetail
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    act(() => {
      result.current.mutate(mockFilters);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockParseAndLog).toHaveBeenCalledWith(
      assessmentsRowsDetailSchema,
      mockAssessmentDetail
    );
  });

  it('should call parseAndLog when assessment detail data is null/undefined', async () => {
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: null
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    act(() => {
      result.current.mutate(mockFilters);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockParseAndLog).toHaveBeenCalledWith(
      assessmentsRowsDetailSchema,
      null
    );
    expect(result.current.data).toBeNull();
  });

  it('should not perform mutation when organizationId is 0', async () => {
    const { result } = renderHook(() =>
      getAssessmentDetail(0, assessmentId, mockFilters)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate(mockFilters);
    });

    expect(mockGetPagedAssessmentsDetails).not.toHaveBeenCalled();
  });

  it('should not perform mutation when assessmentId is 0', async () => {
    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, 0, mockFilters)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.mutate(mockFilters);
    });

    expect(mockGetPagedAssessmentsDetails).not.toHaveBeenCalled();
  });

  it('should handle API errors correctly', async () => {
    const mockError = new Error('API Error: Assessment detail not found');
    mockGetPagedAssessmentsDetails.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    act(() => {
      result.current.mutate(mockFilters);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockGetPagedAssessmentsDetails).toHaveBeenCalledWith(
      organizationId,
      assessmentId,
      mockFilters
    );

    expect(mockParseAndLog).not.toHaveBeenCalled();
  });
});
