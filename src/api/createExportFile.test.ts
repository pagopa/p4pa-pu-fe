import utils from '../utils';
import { act, renderHook } from '../__tests__/renderers';
import { describe, expect, it, vi } from 'vitest';
import {
  ExportFileTypeEnum,
  PaidExportFileRequestDTO,
  ReceiptsArchivingExportFileRequestDTO
} from '../../generated/apiClient';
import {
  createPaidExportFile,
  createReceiptsArchivingExportFile
} from './createExportFile';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        createPaidExportFile: vi.fn(),
        createReceiptsArchivingExportFile: vi.fn()
      }
    }
  }
}));

const mockCreatePaidExportFile = vi.mocked(
  utils.apiClient.bff.createPaidExportFile
);
const mockCreateReceiptsExportFile = vi.mocked(
  utils.apiClient.bff.createReceiptsArchivingExportFile
);

describe('createPaidExportFile', () => {
  it('calls createPaidExportFile with correct parameters', async () => {
    const mockRequestData: PaidExportFileRequestDTO = {
      organizationId: 123,
      exportFileType: ExportFileTypeEnum.PAID,
      fileVersion: 'v1.0',
      filterFields: {
        paymentDateTime: {
          from: '2024-01-01',
          to: '2024-12-31'
        },
        debtPositionTypeOrgId: 1
      }
    };

    const { result } = renderHook(() => createPaidExportFile());

    await act(async () => {
      await result.current.mutateAsync({ data: mockRequestData });
    });

    expect(mockCreatePaidExportFile).toHaveBeenCalledWith(
      mockRequestData,
      undefined
    );
  });

  it('handles error correctly', async () => {
    const mockError = new Error('Create paid export failed');
    mockCreatePaidExportFile.mockRejectedValueOnce(mockError);

    const requestData: PaidExportFileRequestDTO = {
      organizationId: 123,
      exportFileType: ExportFileTypeEnum.PAID,
      fileVersion: 'v1.0',
      filterFields: {}
    };

    const { result } = renderHook(() => createPaidExportFile());

    await expect(
      result.current.mutateAsync({ data: requestData })
    ).rejects.toThrow('Create paid export failed');
  });
});

describe('createReceiptsArchivingExportFile', () => {
  it('calls createReceiptsArchivingExportFile with correct parameters', async () => {
    const mockRequestData: ReceiptsArchivingExportFileRequestDTO = {
      organizationId: 456,
      exportFileType: ExportFileTypeEnum.RECEIPTS_ARCHIVING,
      fileVersion: 'v1.0',
      filterFields: {
        paymentDateTime: {
          from: '2023-01-01',
          to: '2023-12-31'
        }
      }
    };

    const { result } = renderHook(() => createReceiptsArchivingExportFile());

    await act(async () => {
      await result.current.mutateAsync({ data: mockRequestData });
    });

    expect(mockCreateReceiptsExportFile).toHaveBeenCalledWith(
      mockRequestData,
      undefined
    );
  });

  it('handles error correctly', async () => {
    const mockError = new Error('Create receipts export failed');
    mockCreateReceiptsExportFile.mockRejectedValueOnce(mockError);

    const requestData: ReceiptsArchivingExportFileRequestDTO = {
      organizationId: 456,
      exportFileType: ExportFileTypeEnum.RECEIPTS_ARCHIVING,
      fileVersion: 'v2.0',
      filterFields: {}
    };

    const { result } = renderHook(() => createReceiptsArchivingExportFile());

    await expect(
      result.current.mutateAsync({ data: requestData })
    ).rejects.toThrow('Create receipts export failed');
  });
});
