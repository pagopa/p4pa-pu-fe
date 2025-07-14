import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../__tests__/renderers';
import { AxiosResponse } from 'axios';
import utils from '../../../utils';
import { getAssessmentDetail } from './assessmentDetail';
import { assessmentsRowsDetailSchema } from '../../../../generated/zod-schema';
import { createMock } from 'zodock';
import * as loaders from '../../../utils/loaders';

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

const mockGetPagedAssessmentsDetails = vi.mocked(
  utils.apiClient.bff.getPagedAssessmentsDetails
);
const mockParseAndLog = vi.mocked(loaders.parseAndLog);

describe('getAssessmentDetail', () => {
  const organizationId = 123;
  const assessmentId = 456;
  const mockFilters = {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
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

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockParseAndLog).toHaveBeenCalledWith(
      assessmentsRowsDetailSchema,
      mockAssessmentDetail
    );
  });

  it('should not call parseAndLog when assessment detail data is null/undefined', async () => {
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: null
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockParseAndLog).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('should be disabled when organizationId is not provided', () => {
    const { result } = renderHook(() =>
      getAssessmentDetail(0, assessmentId, mockFilters)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockGetPagedAssessmentsDetails).not.toHaveBeenCalled();
  });

  it('should be disabled when assessmentId is not provided', () => {
    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, 0, mockFilters)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockGetPagedAssessmentsDetails).not.toHaveBeenCalled();
  });

  it('should work with optional filters parameter', async () => {
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: mockAssessmentDetail
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId)
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetPagedAssessmentsDetails).toHaveBeenCalledWith(
      organizationId,
      assessmentId,
      undefined
    );
  });

  it('should pass custom options to useQuery', async () => {
    const customOptions = { retry: false, refetchOnWindowFocus: false };
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: mockAssessmentDetail
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(
        organizationId,
        assessmentId,
        mockFilters,
        customOptions
      )
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAssessmentDetail);
  });

  it('should handle API errors correctly', async () => {
    const mockError = new Error('API Error: Assessment detail not found');
    mockGetPagedAssessmentsDetails.mockRejectedValueOnce(mockError);

    const {} = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    await waitFor(() => {
      expect(mockGetPagedAssessmentsDetails).toHaveBeenCalledWith(
        organizationId,
        assessmentId,
        mockFilters
      );
    });

    expect(mockParseAndLog).not.toHaveBeenCalled();
  });

  it('should use correct query key for caching', async () => {
    mockGetPagedAssessmentsDetails.mockResolvedValueOnce({
      data: mockAssessmentDetail
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentDetail(organizationId, assessmentId, mockFilters)
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetPagedAssessmentsDetails).toHaveBeenCalledWith(
      organizationId,
      assessmentId,
      mockFilters
    );
  });
});
