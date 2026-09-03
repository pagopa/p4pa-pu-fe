import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { receiptDetailDTOSchema } from '../../generated/core/zod-schema';
import { createMock } from 'zodock';
import { getReceiptDetail } from './receiptDetail';
import { renderHook, waitFor } from '../__tests__/renderers';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        getReceiptDetail: vi.fn()
      }
    }
  };
});

describe('get Receipt Detail ', () => {
  it('returns data correctly', async () => {
    const dataMock = createMock(receiptDetailDTOSchema);
    const params = {
      organizationId: 33,
      receiptId: dataMock.receiptId,
      iud: 'IUD123'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getReceiptDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getReceiptDetail(params.organizationId, params.receiptId, {
        iud: params.iud
      })
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        params.receiptId,
        { iud: params.iud }
      );
      expect(result.current.data).toEqual(dataMock);
    });
  });
});
