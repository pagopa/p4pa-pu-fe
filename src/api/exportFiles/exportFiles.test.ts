import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { getExportFiles, getExportFile } from '.';
import utils from '../../utils';
import { AxiosResponse } from 'axios';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../../generated/data-contracts';
import { ExportFilesFilteredRequest } from './mapping';

vi.mock('../../utils', () => ({
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
    },
    formatters: {
      date: {
        code: vi.fn()
      },
      extractFilename: vi.fn()
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getExportFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns export files data', async () => {
    const dataMock = {
      content: [
        {
          exportFileId: 1,
          fileName: 'test-file.csv',
          creationDate: '2023-01-01T12:00:00Z',
          operator: 'testOperator',
          status: ExportFileStatus.COMPLETED,
          fileSize: 1024,
          totalRows: 100
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;
    const request: ExportFilesFilteredRequest = {
      filters: {
        exportFileType: ExportFileTypeEnum.PAID
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const spyGetExportFiles = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getExportFiles(organizationId, 'payments')
    );

    // Act
    const data = await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert
    expect(spyGetExportFiles).toHaveBeenCalledWith(organizationId, {
      exportFileType: ExportFileTypeEnum.PAID,
      page: 0,
      size: 10,
      creationDateTimeFrom: undefined,
      creationDateTimeTo: undefined,
      status: undefined,
      fileName: undefined
    });
    expect(data).toEqual(dataMock);
  });

  it('supports complex filter queries', async () => {
    const dataMock = {
      content: [],
      size: 20,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 123;
    const request: ExportFilesFilteredRequest = {
      filters: {
        exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
        dateRange: {
          from: new Date('2023-01-01'),
          to: new Date('2023-01-31')
        },
        status: ExportFileStatus.COMPLETED,
        fileName: 'test'
      },
      pagination: { page: 0, size: 20 },
      sort: ['creationDate,desc', 'fileName,asc']
    };

    vi.spyOn(utils.formatters.date, 'code')
      .mockReturnValueOnce('2023-01-01T00:00:00Z')
      .mockReturnValueOnce('2023-01-31T23:59:59Z');

    const spyGetExportFiles = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getExportFiles(organizationId, 'classifications')
    );

    await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(spyGetExportFiles).toHaveBeenCalledWith(organizationId, {
      exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
      creationDateTimeFrom: '2023-01-01T00:00:00Z',
      creationDateTimeTo: '2023-01-31T23:59:59Z',
      status: ExportFileStatus.COMPLETED,
      fileName: 'test',
      page: 0,
      size: 20,
      sort: ['creationDate,desc', 'fileName,asc']
    });
  });

  it('handles minimal filter query', async () => {
    const dataMock = {
      content: [],
      size: 25,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 456;
    const request: ExportFilesFilteredRequest = {
      filters: {
        exportFileType: ExportFileTypeEnum.RECEIPTS_ARCHIVING
      },
      pagination: { page: 1, size: 25 },
      sort: []
    };

    const spyGetExportFiles = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getExportFiles(organizationId, 'receipts')
    );

    await result.current.mutateAsync(request);

    expect(spyGetExportFiles).toHaveBeenCalledWith(organizationId, {
      exportFileType: ExportFileTypeEnum.RECEIPTS_ARCHIVING,
      page: 1,
      size: 25,
      creationDateTimeFrom: undefined,
      creationDateTimeTo: undefined,
      status: undefined,
      fileName: undefined
    });
  });
});

describe('getExportFile', () => {
  it('downloads file and extracts filename from headers', async () => {
    const fileBlob = new Blob(['data'], { type: 'text/plain' });
    const contentDispositionHeader = 'attachment; filename="test-file.csv"';

    const spyExtractFileName = vi
      .spyOn(utils.formatters, 'extractFilename')
      .mockImplementation((header) => {
        if (header.includes('test-file.csv')) return 'test-file.csv';
        return null;
      });

    const spyDownloadExportFile = vi
      .spyOn(utils.fileshareClient.organization, 'downloadExportFile')
      .mockResolvedValueOnce({
        data: fileBlob,
        headers: { 'content-disposition': contentDispositionHeader }
      } as unknown as AxiosResponse);

    const { result } = renderHook(() => getExportFile(123));

    const data = await result.current.mutateAsync(456);

    expect(data).toEqual({ data: fileBlob, fileName: 'test-file.csv' });
    expect(spyDownloadExportFile).toHaveBeenCalledWith(123, 456, {
      format: 'blob'
    });
    expect(spyExtractFileName).toHaveBeenCalledWith(contentDispositionHeader);
  });

  it('uses default filename if no content-disposition header', async () => {
    const fileBlob = new Blob(['data'], { type: 'text/plain' });

    vi.spyOn(
      utils.fileshareClient.organization,
      'downloadExportFile'
    ).mockResolvedValueOnce({
      data: fileBlob,
      headers: {}
    } as unknown as AxiosResponse);

    const spyExtractFileName = vi
      .spyOn(utils.formatters, 'extractFilename')
      .mockImplementation(() => null);

    const { result } = renderHook(() => getExportFile(123));

    const data = await result.current.mutateAsync(456);

    expect(data).toEqual({ data: fileBlob, fileName: 'file-456' });
    expect(spyExtractFileName).toHaveBeenCalledWith('');
  });
});
