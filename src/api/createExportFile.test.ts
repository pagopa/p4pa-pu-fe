import utils from '../utils';
import { act, renderHook } from '../__tests__/renderers';
import { createExportFile } from './createExportFile';
import { describe, expect, it, vi } from 'vitest';
import {
  ExportFileRequestDTO,
  ExportFileTypeEnum
} from '../../generated/apiClient';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        createExportFile: vi.fn()
      }
    }
  }
}));

const mockCreateExportFile = vi.mocked(utils.apiClient.bff.createExportFile);

describe('createExportFile', () => {
  it('calls createExportFile with correct parameters', async () => {
    const mockRequestData: ExportFileRequestDTO = {
      organizationId: 123,
      exportFileType: ExportFileTypeEnum.PAID,
      fileVersion: '1.0',
      filterFields: {
        paymentDate: {
          from: '2024-01-01',
          to: '2024-12-31'
        }
      }
    };

    const { result } = renderHook(() => createExportFile());

    await act(async () => {
      await result.current.mutateAsync({ data: mockRequestData });
    });

    expect(mockCreateExportFile).toHaveBeenCalledWith(
      mockRequestData,
      undefined
    );
  });

  it('handles error correctly', async () => {
    const mockError = new Error('Create export failed');
    mockCreateExportFile.mockRejectedValueOnce(mockError);

    const requestData: ExportFileRequestDTO = {
      organizationId: 123,
      exportFileType: ExportFileTypeEnum.PAID,
      fileVersion: '1.0',
      filterFields: {}
    };

    const { result } = renderHook(() => createExportFile());

    await expect(
      result.current.mutateAsync({ data: requestData })
    ).rejects.toThrow('Create export failed');
  });
});
