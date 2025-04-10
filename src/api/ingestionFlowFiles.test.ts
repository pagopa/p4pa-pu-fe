import utils from '../utils';
import { act, renderHook } from '../__tests__/renderers';
import {
  downloadIngestionFlowFile,
  uploadIngestionFlowFile
} from './ingestionFlowFiles';
import {
  IngestionFlowFileType,
  UploadIngestionFlowFileResponseDTO
} from '../../generated/fileshare/fileshareClient';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../utils', () => ({
  default: {
    fileshareClient: {
      organization: {
        uploadIngestionFlowFile: vi.fn(),
        downloadIngestionFlowFile: vi.fn()
      }
    }
  }
}));

const mockUploadIngestionFlowFile = vi.mocked(
  utils.fileshareClient.organization.uploadIngestionFlowFile
);

const mockDownloadIngestionFlowFile = vi.mocked(
  utils.fileshareClient.organization.downloadIngestionFlowFile
);

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
  const originalCreateElement = document.createElement;
  const mockAnchorElement = {
    href: '',
    setAttribute: vi.fn(),
    style: { display: '' },
    click: vi.fn()
  };

  beforeEach(() => {
    vi.useFakeTimers();

    document.createElement = vi.fn(
      () => mockAnchorElement
    ) as unknown as typeof document.createElement;

    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;

    vi.useRealTimers();
  });

  it('downloads file with correct parameters and handles file name from header', async () => {
    const mockFileData = new Uint8Array([1, 2, 3]).buffer;
    const mockFileName = 'test-file.csv';

    mockDownloadIngestionFlowFile.mockResolvedValueOnce({
      data: mockFileData,
      headers: {
        'content-disposition': `attachment; filename="${mockFileName}"`
      }
    } as unknown as AxiosResponse);

    await downloadIngestionFlowFile(123, 456);

    expect(mockDownloadIngestionFlowFile).toHaveBeenCalledWith(123, 456);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.href).toBe('blob:mock-url');
    expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith(
      'download',
      mockFileName
    );
    expect(mockAnchorElement.click).toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('uses default filename when content-disposition header is missing', async () => {
    mockDownloadIngestionFlowFile.mockResolvedValueOnce({
      data: new ArrayBuffer(10),
      headers: {}
    } as AxiosResponse);

    await downloadIngestionFlowFile(123, 456);

    expect(mockAnchorElement.setAttribute).toHaveBeenCalledWith(
      'download',
      'downloaded-file-456'
    );
  });
});
