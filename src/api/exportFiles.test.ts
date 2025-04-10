import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { getExportFiles } from './exportFiles';
import utils from '../utils';
import { AxiosResponse } from 'axios';
import {
  ExportFileStatus,
  ExportFileTypeEnum
} from '../../generated/apiClient';

vi.mock('../../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getExportFiles: vi.fn()
        }
      }
    }
  };
});

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

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
