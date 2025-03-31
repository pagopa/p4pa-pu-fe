import { AxiosResponse } from 'axios';
import { createMock } from 'zodock';
import utils from '../utils';
import { renderHook, waitFor } from '../__tests__/renderers';
import { transferDTOSchema } from '../../generated/zod-schema';
import { getTransfers } from './transfers';

vi.mock('../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getTransfers: vi.fn()
        }
      }
    },
    parseAndLog: vi.fn()
  };
});

describe('getTransfers', () => {
  it('returns data correctly', async () => {
    const dataMock = createMock(transferDTOSchema);
    const params = { organizationId: 34, installmentId: 22 };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTransfers')
      .mockResolvedValue({ data: [dataMock] } as AxiosResponse);

    const { result } = renderHook(() =>
      getTransfers(params.organizationId, params.installmentId)
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(params.organizationId, {
        installmentId: params.installmentId
      });
      expect(result.current.data).toEqual([dataMock]);
    });
  });

  it('does not run query when parameters are missing', async () => {
    const apiMock = vi.spyOn(utils.apiClient.bff, 'getTransfers');

    renderHook(() => getTransfers(0, 0));

    expect(apiMock).not.toHaveBeenCalled();
  });
});
