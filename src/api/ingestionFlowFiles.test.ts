import utils from '../utils';
import { act, renderHook } from '../__tests__/renderers';
import { uploadIngestionFlowFile } from './ingestionFlowFiles';
import {
  IngestionFlowFileType,
  UploadIngestionFlowFileResponseDTO
} from '../../generated/fileshare/fileshareClient';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../utils', () => ({
  default: {
    fileshareClient: {
      ingestionflowfiles: {
        uploadIngestionFlowFile: vi.fn()
      }
    }
  }
}));

const mockUploadIngestionFlowFile = vi.mocked(
  utils.fileshareClient.ingestionflowfiles.uploadIngestionFlowFile
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
