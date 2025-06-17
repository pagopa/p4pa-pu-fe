import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { getClassificationDetail } from './getClassificationDetail';
import { renderHook, waitFor } from '../__tests__/renderers';
import { classificationDetailViewDTOSchema } from '../../generated/zod-schema';
import { createMock } from 'zodock';

const dataMock = createMock(classificationDetailViewDTOSchema);

describe('getClassificationDetails query hook', () => {
  it('returns data correctly', async () => {
    vi.spyOn(utils.apiClient.bff, 'getClassificationDetail').mockResolvedValue({
      data: dataMock
    } as AxiosResponse);

    const { result } = renderHook(() => getClassificationDetail(1, 1));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(dataMock);
  });
});
