import utils from '../utils';
import { act, renderHook } from '../__tests__/renderers';
import { describe, expect, it, vi } from 'vitest';
import {
  ExportFileTypeEnum,
  PaidExportFileRequest,
  ReceiptsArchivingExportFileRequest
} from '../../generated/apiClient';
import {
  createClassificationsExportFile,
  createPaidExportFile,
  createReceiptsArchivingExportFile
} from './createExportFile';
import {
  ClassificationsExportFileRequestDTO,
  LabelEnum
} from '../../generated/data-contracts';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        createPaidExportFile: vi.fn(),
        createReceiptsArchivingExportFile: vi.fn(),
        createClassificationsExportFile: vi.fn()
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

const mockCreateClassificationsExportFile = vi.mocked(
  utils.apiClient.bff.createClassificationsExportFile
);

describe('createPaidExportFile', () => {
  it('calls createPaidExportFile with correct parameters', async () => {
    const mockRequestData: PaidExportFileRequest = {
      organizationId: 123,
      exportFileType: ExportFileTypeEnum.PAID,
      fileVersion: 'v1.0',
      filterFields: {
        paymentDate: {
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

    const requestData: PaidExportFileRequest = {
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
    const mockRequestData: ReceiptsArchivingExportFileRequest = {
      organizationId: 456,
      exportFileType: ExportFileTypeEnum.RECEIPTS_ARCHIVING,
      fileVersion: 'v1.0',
      filterFields: {
        paymentDate: {
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

    const requestData: ReceiptsArchivingExportFileRequest = {
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

describe('createClassificationsExportFile', () => {
  it('calls createClassificationsExportFile with correct parameters', async () => {
    const mockRequestData: ClassificationsExportFileRequestDTO = {
      organizationId: 789,
      exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
      fileVersion: 'v1.0',
      filterFields: {
        lastClassificationDate: {
          from: '2024-01-01',
          to: '2024-12-31'
        },
        iuf: 'IUF123456',
        label: LabelEnum.DOPPI
      }
    };

    const { result } = renderHook(() => createClassificationsExportFile());

    await act(async () => {
      await result.current.mutateAsync({ data: mockRequestData });
    });

    expect(mockCreateClassificationsExportFile).toHaveBeenCalledWith(
      mockRequestData,
      undefined
    );
  });

  it('handles error correctly', async () => {
    const mockError = new Error('Create classifications export failed');
    mockCreateClassificationsExportFile.mockRejectedValueOnce(mockError);

    const requestData: ClassificationsExportFileRequestDTO = {
      organizationId: 789,
      exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
      fileVersion: 'v1.4',
      filterFields: {}
    };

    const { result } = renderHook(() => createClassificationsExportFile());

    await expect(
      result.current.mutateAsync({ data: requestData })
    ).rejects.toThrow('Create classifications export failed');
  });
});
