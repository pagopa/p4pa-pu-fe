import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { getExportFiles, getExportFile } from './exportFiles';
import utils from '../utils';
import { AxiosResponse } from 'axios';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';

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

    vi.spyOn(utils.formatters.date, 'code').mockReturnValue(
      '2024-08-01T00:00:00+02:00'
    );

    const spyGetExportFiles = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getExportFiles(organizationId, '' /* routingCategory placeholder */)
    );

    // We must call mutateAsync since useMutation returns a mutate function:
    const data = await result.current.mutateAsync({
      filters,
      pagination: { page: filters.page, size: filters.size },
      sort: filters.sort || []
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(spyGetExportFiles).toHaveBeenCalledWith(organizationId, {
      ...filters,
      creationDateFrom: '2024-08-01T00:00:00+02:00',
      creationDateTo: '2024-08-01T00:00:00+02:00',
      sort: filters.sort || []
    });
    expect(data).toEqual(dataMock);
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
      creationDateFrom: new Date('2023-01-01'),
      creationDateTo: new Date('2023-01-31'),
      status: ExportFileStatus.COMPLETED,
      fileName: 'test',
      page: 0,
      size: 20,
      sort: ['creationDate,desc', 'fileName,asc']
    };

    vi.spyOn(utils.formatters.date, 'code').mockReturnValue(
      '2024-08-01T00:00:00+02:00'
    );

    const spyGetExportFiles = vi
      .spyOn(utils.apiClient.bff, 'getExportFiles')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getExportFiles(organizationId, ''));

    await result.current.mutateAsync({
      filters: complexFilters,
      pagination: { page: complexFilters.page, size: complexFilters.size },
      sort: complexFilters.sort
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(spyGetExportFiles).toHaveBeenCalledWith(organizationId, {
      ...complexFilters,
      creationDateFrom: '2024-08-01T00:00:00+02:00',
      creationDateTo: '2024-08-01T00:00:00+02:00'
    });
  });
});

describe('getExportFile', () => {
  it('downloads file and extracts filename from headers', async () => {
    const fileBlob = new Blob(['data'], { type: 'text/plain' });
    const contentDispositionHeader = 'attachment; filename="test-file.csv"';

    const spyExtracFileName = vi
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
    expect(spyExtracFileName).toHaveBeenCalledWith(contentDispositionHeader);
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

    const spyExtracFileName = vi
      .spyOn(utils.formatters, 'extractFilename')
      .mockImplementation(() => null);

    const { result } = renderHook(() => getExportFile(123));

    const data = await result.current.mutateAsync(456);

    expect(data).toEqual({ data: fileBlob, fileName: 'file-456' });
    expect(spyExtracFileName).toHaveBeenCalledWith('');
  });
});
