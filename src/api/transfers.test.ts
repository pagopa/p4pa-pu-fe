import { AxiosResponse } from 'axios';
import { createMock } from 'zodock';
import utils from '../utils';
import { act, renderHook, waitFor } from '../__tests__/renderers';
import { transferDTOSchema } from '../../generated/core/zod-schema';
import { getTransfers, validateTaxonomyCategory } from './transfers';

vi.mock('../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getTransfers: vi.fn(),
          validateTaxonomyCategory: vi.fn()
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

describe('validateTaxonomyCategory', async () => {
  it('should successfully test a Taxonomy category', async () => {
    const mockResponse = {
      data: true,
      status: 200,
      statusText: 'OK'
    };

    vi.spyOn(utils.apiClient.bff, 'validateTaxonomyCategory').mockResolvedValue(
      mockResponse as unknown as AxiosResponse
    );

    const { result } = renderHook(() => validateTaxonomyCategory());

    await act(async () => {
      const response = await result.current.mutateAsync({
        data: { orgFiscalCode: '123', taxonomyCategory: 'TEST' }
      });

      expect(response.data).toBe(true);
    });
  });
});
