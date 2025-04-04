import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { getTreasuries } from './treasuries';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        getTreasuries: vi.fn()
      }
    }
  };
});

describe('get Treasuries list', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      content: [
        {
          treasuryId: '77436-2022-1',
          organizationId: 1,
          billYear: '2022',
          billCode: '77436',
          regionValueDate: '2022-10-11',
          billDate: '2022-10-11',
          iuf: '2025-03-10UNCRITMM-1iv6iotaa3td2',
          billAmountCents: 10000,
          provisionalCode: 'prov1 ',
          provisionalAe: '2022',
          pspLastName: 'BANCA MONTE DEI PASCHI DI SIENA SPA',
          documentCode: '67351  ',
          documentYear: '2022',
          _links: {
            self: {
              href: 'localhost/crud/treasuries-view/77436-2022-1'
            },
            treasuryView: {
              href: 'localhost/crud/treasuries-view/77436-2022-1'
            }
          }
        },
        {
          treasuryId: '77437-2023-1',
          organizationId: 1,
          billYear: '2023',
          billCode: '77437',
          regionValueDate: '2022-10-11',
          billDate: '2023-10-11',
          iuf: '2025-03-10UNCRITMM-1iv6iotaa3td2',
          billAmountCents: 10000,
          iuv: '',
          provisionalCode: 'prov2 ',
          provisionalAe: '2023',
          pspLastName: 'BANCA MONTE DEI PASCHI DI SIENA SPA',
          documentCode: '67352  ',
          documentYear: '2023',
          _links: {
            self: {
              href: 'localhost/crud/treasuries-view/77437-2023-1'
            },
            treasuryView: {
              href: 'localhost/crud/treasuries-view/77437-2023-1'
            }
          }
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
      billAmountCents: 10000,
      page: undefined,
      size: undefined,
      sort: undefined
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTreasuries')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getTreasuries(params.organizationId));

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

  it('does not fetch data', () => {
    const { result } = renderHook(() => getTreasuries(0));

    expect(result.current.data).toBeUndefined();
  });
});
