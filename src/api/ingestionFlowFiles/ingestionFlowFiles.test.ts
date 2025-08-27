import utils from '../../utils';
import { act, renderHook } from '../../__tests__/renderers';
import {
  getIngestionFlowFile,
  getIngestionFlowFiles,
  uploadIngestionFlowFile
} from './';
import {
  IngestionFlowFileType,
  UploadIngestionFlowFileResponseDTO
} from '../../../generated/fileshare/fileshareClient';
import { IngestionFlowFileTypeEnum } from '../../../generated/data-contracts';
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
        downloadIngestionFlowFile: vi.fn()
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

const mockExtractFilename = vi.mocked(formatters.extractFilename);
const mockDateCode = vi.mocked(utils.formatters.date.code);

describe('getIngestionFlowFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDateCode.mockImplementation((date) => date?.toISOString() || '');
  });

  it('should fetch ingestion flow files successfully', async () => {
    const mockFiles = [
      { id: 1, name: 'file1.csv' },
      { id: 2, name: 'file2.csv' }
    ];

    mockGetIngestionFlowFiles.mockResolvedValueOnce({
      data: mockFiles
    } as AxiosResponse);

    const { result } = renderHook(() => getIngestionFlowFiles(123, 'TREASURY'));

    await act(async () => {
      const request = {
        filters: {
          ingestionFlowFileTypes: [IngestionFlowFileTypeEnum.TREASURY_CSV],
          creationDateFrom: new Date('2023-01-01'),
          size: 10,
          page: 0
        },
        pagination: { page: 0, size: 10 },
        sort: []
      };
      const response = await result.current.mutateAsync(request);
      expect(response).toEqual(mockFiles);
    });

    expect(mockGetIngestionFlowFiles).toHaveBeenCalled();
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

describe('downloadIngestionFlowFile', () => {
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
