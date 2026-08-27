import utils from '../../utils';
import { act, renderHook } from '../../__tests__/renderers';
import {
  getIngestionFlowFiles,
  getIngestionFlowFile,
  getIngestionFlowFileIuv,
  getIngestionFlowFileNotice,
  uploadIngestionFlowFile
} from './';
import {
  IngestionFlowFileType,
  UploadIngestionFlowFileResponseDTO
} from '../../../generated/fileshare/client';
import { IngestionFlowFileTypeEnum } from '../../../generated/core/data-contracts';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as formatters from '../../utils/formatters';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getIngestionFlowFiles: vi.fn()
      }
    },
    fileshareClient: {
      organization: {
        uploadIngestionFlowFile: vi.fn(),
        downloadIngestionFlowFile: vi.fn(),
        downloadIuvFile: vi.fn(),
        downloadNotice: vi.fn()
      }
    },
    formatters: {
      date: {
        code: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/formatters', () => ({
  extractFilename: vi.fn()
}));

const mockGetIngestionFlowFiles = vi.mocked(
  utils.apiClient.bff.getIngestionFlowFiles
);

const mockUploadIngestionFlowFile = vi.mocked(
  utils.fileshareClient.organization.uploadIngestionFlowFile
);

const mockDownloadIngestionFlowFile = vi.mocked(
  utils.fileshareClient.organization.downloadIngestionFlowFile
);

const mockDownloadIuvFile = vi.mocked(
  utils.fileshareClient.organization.downloadIuvFile
);

const mockDownloadNotice = vi.mocked(
  utils.fileshareClient.organization.downloadNotice
);

const mockExtractFilename = vi.mocked(formatters.extractFilename);
const mockDateCode = vi.mocked(utils.formatters.date.code);

describe('getIngestionFlowFiles', () => {
  it('fetches and returns ingestion flow files data', async () => {
    const mockData = {
      content: [
        {
          ingestionFlowFileId: 1,
          fileName: 'test-file.csv',
          creationDate: '2023-01-01T12:00:00Z',
          status: 'COMPLETED'
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;
    const filters = {
      ingestionFlowFileTypes: [IngestionFlowFileTypeEnum.TREASURY_CSV],
      creationDateFrom: new Date('2023-01-01'),
      creationDateTo: new Date('2023-01-31'),
      page: 0,
      size: 10
    };
    const pagination = { page: 0, size: 10 };
    const sort = ['creationDate,desc'];

    mockDateCode.mockReturnValue('2024-08-01T00:00:00+02:00');
    mockGetIngestionFlowFiles.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getIngestionFlowFiles(organizationId, '')
    );

    await act(async () => {
      const response = await result.current.mutateAsync({
        filters,
        pagination,
        sort
      });
      expect(response).toEqual(mockData);
    });

    expect(mockGetIngestionFlowFiles).toHaveBeenCalledWith(organizationId, {
      ingestionFlowFileTypes: [IngestionFlowFileTypeEnum.TREASURY_CSV],
      page: 0,
      size: 10,
      sort: ['creationDate,desc'],
      creationDateTimeFrom: '2024-08-01T00:00:00+02:00',
      creationDateTimeTo: '2024-08-01T00:00:00+02:00',
      fileName: undefined
    });
  });
});

describe('uploadIngestionFlowFile', () => {
  it('uploads file with correct parameters', async () => {
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const mockResponse = { success: true };

    mockUploadIngestionFlowFile.mockResolvedValueOnce({
      data: mockResponse
    } as unknown as AxiosResponse<UploadIngestionFlowFileResponseDTO>);

    const { result } = renderHook(() =>
      uploadIngestionFlowFile({
        organizationId: 123,
        ingestionFlowFileType: IngestionFlowFileType.TREASURY_CSV
      })
    );

    await act(async () => {
      const response = await result.current.mutateAsync(file);
      expect(response).toEqual(mockResponse);
    });

    expect(mockUploadIngestionFlowFile).toHaveBeenCalledWith(
      123,
      {
        ingestionFlowFileType: 'TREASURY_CSV',
        fileOrigin: 'PORTAL',
        fileName: 'test.csv'
      },
      { ingestionFlowFile: file },
      undefined
    );
  });

  it('handles upload error', async () => {
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const mockError = new Error('Upload failed');

    mockUploadIngestionFlowFile.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      uploadIngestionFlowFile({
        organizationId: 123,
        ingestionFlowFileType: IngestionFlowFileType.TREASURY_CSV
      })
    );

    await act(async () => {
      await result.current.mutateAsync(file).catch((error) => {
        expect(error).toBe(mockError);
      });
    });

    expect(mockUploadIngestionFlowFile).toHaveBeenCalled();
  });
});

describe('getIngestionFlowFile', () => {
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

    mockDownloadIngestionFlowFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {
        'content-disposition': `attachment; filename="${mockFileName}"`
      }
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => getIngestionFlowFile(123));

    await act(async () => {
      const response = await result.current.mutateAsync(456);
      expect(response).toEqual({ data: mockFileData, fileName: mockFileName });
    });

    expect(mockDownloadIngestionFlowFile).toHaveBeenCalledWith(123, 456, {
      format: 'blob'
    });

    expect(mockExtractFilename).toHaveBeenCalledWith(
      `attachment; filename="${mockFileName}"`
    );
  });

  it('uses default filename when content-disposition header is missing', async () => {
    const mockFileData = new Blob(['test data'], { type: 'text/plain' });

    mockDownloadIngestionFlowFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {}
    } as unknown as AxiosResponse);

    mockExtractFilename.mockReturnValueOnce(null);
    const { result } = renderHook(() => getIngestionFlowFile(123));

    await act(async () => {
      const response = await result.current.mutateAsync(456);
      expect(response).toEqual({ data: mockFileData, fileName: 'file-456' });
    });

    expect(mockExtractFilename).toHaveBeenCalledWith('');
  });
});

describe('getIngestionFlowFileIuv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractFilename.mockImplementation((header) => {
      if (header.includes('iuv-file.csv')) {
        return 'iuv-file.csv';
      }
      return null;
    });
  });

  it('returns blob and filename from response with content-disposition header', async () => {
    const mockFileData = new Blob(['iuv data'], { type: 'text/plain' });
    const mockFileName = 'iuv-file.csv';

    mockDownloadIuvFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {
        'content-disposition': `attachment; filename="${mockFileName}"`
      }
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => getIngestionFlowFileIuv(123));

    await act(async () => {
      const response = await result.current.mutateAsync(789);
      expect(response).toEqual({ data: mockFileData, fileName: mockFileName });
    });

    expect(mockDownloadIuvFile).toHaveBeenCalledWith(123, 789, {
      format: 'blob'
    });

    expect(mockExtractFilename).toHaveBeenCalledWith(
      `attachment; filename="${mockFileName}"`
    );
  });

  it('uses default filename when content-disposition header is missing', async () => {
    const mockFileData = new Blob(['iuv data'], { type: 'text/plain' });

    mockDownloadIuvFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {}
    } as unknown as AxiosResponse);

    mockExtractFilename.mockReturnValueOnce(null);
    const { result } = renderHook(() => getIngestionFlowFileIuv(123));

    await act(async () => {
      const response = await result.current.mutateAsync(789);
      expect(response).toEqual({ data: mockFileData, fileName: 'iuv-789' });
    });

    expect(mockDownloadIuvFile).toHaveBeenCalledWith(123, 789, {
      format: 'blob'
    });

    expect(mockExtractFilename).toHaveBeenCalledWith('');
  });

  it('handles download error', async () => {
    const mockError = new Error('Download failed');

    mockDownloadIuvFile.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => getIngestionFlowFileIuv(123));

    await act(async () => {
      await result.current.mutateAsync(789).catch((error) => {
        expect(error).toBe(mockError);
      });
    });

    expect(mockDownloadIuvFile).toHaveBeenCalledWith(123, 789, {
      format: 'blob'
    });
  });
});

describe('getIngestionFlowFileNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractFilename.mockImplementation((header) => {
      if (header.includes('notice-file.zip')) {
        return 'notice-file.zip';
      }
      return null;
    });
  });

  it('returns blob and filename from response with content-disposition header', async () => {
    const mockFileData = new Blob(['notice data'], { type: 'application/zip' });
    const mockFileName = 'notice-file.zip';

    mockDownloadNotice.mockResolvedValueOnce({
      data: mockFileData,
      headers: {
        'content-disposition': `attachment; filename="${mockFileName}"`
      }
    } as unknown as AxiosResponse);

    const { result } = renderHook(() => getIngestionFlowFileNotice(123));

    await act(async () => {
      const response = await result.current.mutateAsync(101);
      expect(response).toEqual({ data: mockFileData, fileName: mockFileName });
    });

    expect(mockDownloadNotice).toHaveBeenCalledWith(123, 101, {
      format: 'blob'
    });

    expect(mockExtractFilename).toHaveBeenCalledWith(
      `attachment; filename="${mockFileName}"`
    );
  });

  it('uses default filename when content-disposition header is missing', async () => {
    const mockFileData = new Blob(['notice data'], { type: 'application/zip' });

    mockDownloadNotice.mockResolvedValueOnce({
      data: mockFileData,
      headers: {}
    } as unknown as AxiosResponse);

    mockExtractFilename.mockReturnValueOnce(null);
    const { result } = renderHook(() => getIngestionFlowFileNotice(123));

    await act(async () => {
      const response = await result.current.mutateAsync(101);
      expect(response).toEqual({
        data: mockFileData,
        fileName: 'notice-101.zip'
      });
    });

    expect(mockDownloadNotice).toHaveBeenCalledWith(123, 101, {
      format: 'blob'
    });

    expect(mockExtractFilename).toHaveBeenCalledWith('');
  });

  it('handles download error', async () => {
    const mockError = new Error('Download failed');

    mockDownloadNotice.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => getIngestionFlowFileNotice(123));

    await act(async () => {
      await result.current.mutateAsync(101).catch((error) => {
        expect(error).toBe(mockError);
      });
    });

    expect(mockDownloadNotice).toHaveBeenCalledWith(123, 101, {
      format: 'blob'
    });
  });
});
