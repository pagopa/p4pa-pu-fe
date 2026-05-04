import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { getTreasuryDetail } from './treasuryDetail';
import { renderHook, waitFor } from '../__tests__/renderers';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        getTreasuryDetail: vi.fn()
      }
    }
  };
});

describe('get Receipt Detail ', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      creationDate: '2025-02-25T14:48:30.843388',
      updateDate: '2025-03-07T10:03:58.199601',
      updateOperatorExternalId: 'WS_USER-piattaforma-unitaria_',
      treasuryId: '77436-2022-5',
      billYear: '2025',
      billCode: '77438',
      ingestionFlowFileId: 201,
      organizationId: 1,
      iuf: '2024-03-19UNCsITMM-000',
      iuv: '32',
      remittanceDescription:
        '/PUR/LGPE-RIVERSURI.2022-10- TRXID: 0000000000000066',
      billAmountCents: 50000,
      billDate: '2022-10-12',
      receptionDate: '2025-03-07T10:03:57.891082',
      documentCode: '67351  ',
      pspLastName: 'BANCA MONTE',
      pspAddress: 'PIAZZA SALIMBENI,3                                ',
      pspPostalCode: '00000',
      regionValueDate: '2022-10-12',
      actualSuspensionDate: '2022-10-11',
      managementProvisionalCode: '0000099999',
      endToEndId: 'RF05013300000022785700000',
      regularized: false,
      _links: {
        self: {
          href: 'localhost'
        },
        treasury: {
          href: 'localhost'
        }
      }
    };

    const params = { organizationId: 33, treasuryId: dataMock.treasuryId };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTreasuryDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getTreasuryDetail(params.organizationId, params.treasuryId || '')
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        params.treasuryId
      );
      expect(result.current.data).toEqual(dataMock);
    });
  });
});
