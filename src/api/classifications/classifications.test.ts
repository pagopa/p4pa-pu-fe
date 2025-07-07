import utils from '../../utils';
import * as mapping from './mappings';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers'; // your custom renderHook wrapper
import type { ClassificationsFilteredRequest } from './mappings';
import { FilterValues } from '../../models/Filters';
import { getClassifications } from '.';

vi.mock('../../utils', () => {
  const originalModule =
    vi.importActual<typeof import('../../utils')>('../../utils');
  return {
    ...originalModule,
    default: {
      apiClient: {
        bff: {
          getTreasuredClassifications: vi.fn()
        }
      }
    }
  };
});

vi.mock('./mappings', () => ({
  buildQueryParams: vi.fn()
}));

describe('getClassifications', () => {
  const dataMock = {
    classifications: [
      {
        classificationId: '123',
        name: 'Classification A',
        description: 'Description A'
      },
      {
        classificationId: '456',
        name: 'Classification B',
        description: 'Description B'
      }
    ],
    total: 2,
    page: 0,
    size: 10
  };

  const organizationId = 1;

  // Provide a fully typed filters object matching your FilterValues type
  const filters: FilterValues = {
    ACCOUNTING_DATE_FROM: null,
    ACCOUNTING_DATE_TO: null,
    ACCOUNT_REGISTRY_CODE: 'REG123',
    AMOUNT: 5000,
    BILL_CODE: 'BILL001',
    BILL_FROM: null,
    BILL_DATE_FROM: null,
    BILL_DATE_TO: null,
    DOCUMENT_CODE: 'DOC001',
    DOCUMENT_CODE_FROM: null,
    IUV: 'IUV001',
    IUR: 'IUR001',
    IUD: 'IUD001',
    IUF: 'IUF001',
    PAYER: 'Payer Name',
    PSP_COMPANY_NAME: 'PSP Company',
    REGULATION_UNIQUE_IDENTIFIER: 'REGID123',
    REMITTANCE_INFORMATION: 'Some info',
    REPORT_ID: 'Report1',
    TEMPORARY_CODE: 'TempCode',
    TEMPORARY_CODE_FROM: null,
    VALUE_DATE_FROM: null,
    VALUE_DATE_TO: null,
    REGION_VALUE_DATE_FROM: null,
    REGION_VALUE_DATE_TO: null,
    PAY_DATE_FROM: null,
    PAY_DATE_TO: null,
    CLASSIFICATION_TYPE: 'TypeA',
    LAST_CLASSIFICATION_DATE_FROM: null,
    LAST_CLASSIFICATION_DATE_TO: null,
    REGULATION_DATE_FROM: null,
    REGULATION_DATE_TO: null,
    PAYMENT_DATE_FROM: null,
    PAYMENT_DATE_TO: null
  };

  const request: ClassificationsFilteredRequest = {
    filters,
    pagination: { page: 0, size: 10 },
    sort: ['name']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data correctly', async () => {
    (mapping.buildQueryParams as ReturnType<typeof vi.fn>).mockReturnValue(
      'mock-query-string'
    );

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTreasuredClassifications')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getClassifications({ organizationId }));

    await result.current.mutateAsync(request);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(mapping.buildQueryParams).toHaveBeenCalledWith(request);
    expect(apiMock).toHaveBeenCalledWith(organizationId, 'mock-query-string', {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('does not fetch data when organizationId is 0', () => {
    const { result } = renderHook(() =>
      getClassifications({ organizationId: 0 })
    );

    expect(result.current.data).toBeUndefined();
  });
});
