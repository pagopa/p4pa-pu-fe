import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '../__tests__/renderers';
import { getExportFile, getExportFiles } from './exportFiles';
import utils from '../utils';
import { AxiosResponse } from 'axios';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';
import * as formatters from '../utils/formatters';

vi.mock('../utils', () => {
  return {
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
  };
});

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

vi.mock('../utils/formatters', () => ({
  extractFilename: vi.fn()
}));

const mockDownloadExportFile = vi.mocked(
  utils.fileshareClient.organization.downloadExportFile
);

const mockExtractFilename = vi.mocked(formatters.extractFilename);

describe('getExportFiles', () => {
  it('returns data correctly', async () => {
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
    const query = {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getExportFiles(organizationId, query));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(dataMock);
    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('applies complex filters correctly', async () => {
    const dataMock = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 123;
    const complexQuery = {
      exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
      creationDateFrom: '2023-01-01',
      creationDateTo: '2023-01-31',
      status: ExportFileStatus.COMPLETED,
      fileName: 'test',
      page: 0,
      size: 20,
      sort: ['creationDate,desc', 'fileName,asc']
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getExportFiles(organizationId, complexQuery)
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiMock).toHaveBeenCalledWith(organizationId, complexQuery, {
      paramsSerializer: {
        indexes: null
      }
    });
  });
});

describe('downloadExportFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractFilename.mockImplementation((header) => {
      if (header.includes('test-file.csv')) {
        return 'test-file.csv';
      }
      return null;
    });
  });

  it('returns blob and filename from response with content-disposition header', async () => {
    const mockFileData = new Blob(['test data'], { type: 'text/plain' });
    const mockFileName = 'test-file.csv';

    mockDownloadExportFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {
        'content-disposition': `attachment; filename="${mockFileName}"`
      }
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => getExportFile(123));

    await act(async () => {
      const response = await result.current.mutateAsync(456);
      expect(response).toEqual({ data: mockFileData, fileName: mockFileName });
    });

    expect(mockDownloadExportFile).toHaveBeenCalledWith(123, 456, {
      format: 'blob'
    });
    expect(mockExtractFilename).toHaveBeenCalledWith(
      `attachment; filename="${mockFileName}"`
    );
  });

  it('uses default filename when content-disposition header is missing', async () => {
    const mockFileData = new Blob(['test data'], { type: 'text/plain' });

    mockDownloadExportFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {}
    } as unknown as AxiosResponse);

    mockExtractFilename.mockReturnValueOnce(null);

    const { result } = renderHook(() => getExportFile(123));

    await act(async () => {
      const response = await result.current.mutateAsync(456);
      expect(response).toEqual({ data: mockFileData, fileName: 'file-456' });
    });
    expect(mockExtractFilename).toHaveBeenCalledWith('');
  });
});
