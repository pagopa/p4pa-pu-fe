import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '../__tests__/renderers';
import { getExportFile, getExportFiles } from './exportFiles';
import utils from '../utils';
import { AxiosResponse } from 'axios';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';
import * as formatters from '../utils/formatters';

// Mock utils api clients and helpers
vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getExportFiles: vi.fn()
      }
    },
    fileshareClient: {
      organization: {
        downloadExportFile: vi.fn()
      }
    }
  }
}));

vi.mock('../utils/formatters', () => ({
  extractFilename: vi.fn()
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

const mockGetExportFiles = vi.mocked(utils.apiClient.bff.getExportFiles);
const mockDownloadExportFile = vi.mocked(
  utils.fileshareClient.organization.downloadExportFile
);
const mockExtractFilename = vi.mocked(formatters.extractFilename);

describe('getExportFiles', () => {
  it('fetches and returns export files data', async () => {
    const dataMock = {
      content: [
        {
          exportFileId: 1,
          fileName: 'test-file.csv',
          creationDate: '2023-01-01T12:00:00Z',
          operator: 'testOperator',
          status: ExportFileStatus.COMPLETED
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;
    const filters = {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10,
      sort: undefined
    };

    mockGetExportFiles.mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getExportFiles(organizationId, '' /* routingCategory placeholder */)
    );

    // We must call mutateAsync since useMutation returns a mutate function:
    await act(async () => {
      await result.current.mutateAsync({
        filters,
        pagination: { page: filters.page, size: filters.size },
        sort: filters.sort || []
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetExportFiles).toHaveBeenCalledWith(organizationId, {
      ...filters,
      sort: filters.sort || []
    });
    expect(result.current.data).toEqual(dataMock);
  });

  it('supports complex filter queries', async () => {
    const dataMock = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };
    const organizationId = 123;
    const complexFilters = {
      exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
      creationDateFrom: '2023-01-01',
      creationDateTo: '2023-01-31',
      status: ExportFileStatus.COMPLETED,
      fileName: 'test',
      page: 0,
      size: 20,
      sort: ['creationDate,desc', 'fileName,asc']
    };

    mockGetExportFiles.mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getExportFiles(organizationId, ''));

    await act(async () => {
      await result.current.mutateAsync({
        filters: complexFilters,
        pagination: { page: complexFilters.page, size: complexFilters.size },
        sort: complexFilters.sort
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetExportFiles).toHaveBeenCalledWith(
      organizationId,
      complexFilters
    );
  });
});

describe('getExportFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockExtractFilename.mockImplementation((header) => {
      if (header.includes('test-file.csv')) return 'test-file.csv';
      return null;
    });
  });

  it('downloads file and extracts filename from headers', async () => {
    const fileBlob = new Blob(['data'], { type: 'text/plain' });
    const contentDispositionHeader = 'attachment; filename="test-file.csv"';

    mockDownloadExportFile.mockResolvedValueOnce({
      data: fileBlob,
      headers: { 'content-disposition': contentDispositionHeader }
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => getExportFile(123));

    let response;
    await act(async () => {
      response = await result.current.mutateAsync(456);
    });

    expect(response).toEqual({ data: fileBlob, fileName: 'test-file.csv' });
    expect(mockDownloadExportFile).toHaveBeenCalledWith(123, 456, {
      format: 'blob'
    });
    expect(mockExtractFilename).toHaveBeenCalledWith(contentDispositionHeader);
  });

  it('uses default filename if no content-disposition header', async () => {
    const fileBlob = new Blob(['data'], { type: 'text/plain' });

    mockDownloadExportFile.mockResolvedValueOnce({
      data: fileBlob,
      headers: {}
    } as unknown as AxiosResponse);

    mockExtractFilename.mockReturnValueOnce(null);

    const { result } = renderHook(() => getExportFile(123));

    let response;
    await act(async () => {
      response = await result.current.mutateAsync(456);
    });

    expect(response).toEqual({ data: fileBlob, fileName: 'file-456' });
    expect(mockExtractFilename).toHaveBeenCalledWith('');
  });
});
