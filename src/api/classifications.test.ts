import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { getClassifications } from './classifications';

vi.mock('../utils', async () => {
  const actual = await vi.importActual<typeof import('../utils')>('../utils');
  return {
    ...actual,
    apiClient: {
      bff: {
        getTreasuredClassifications: vi.fn()
      }
    }
  };
});

describe('getClassifications', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      content: [
        {
          id: '1',
          label: 'label 1',
          description: 'description 1'
        },
        {
          id: '2',
          label: 'label 2',
          description: 'description 2'
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const params = {
      organizationId: 1
    };

    const query = {
      type: 'test',
      page: 0,
      size: 10
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTreasuredClassifications')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getClassifications(params.organizationId)
    );

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(params.organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('does not fetch data if mutate is not called', () => {
    const { result } = renderHook(() => getClassifications(99));

    expect(result.current.data).toBeUndefined();
  });
});
