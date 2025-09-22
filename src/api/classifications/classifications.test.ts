import utils from '../../utils';
import * as mapping from './mappings';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
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

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn((_schema, data) => data)
}));

describe('getClassifications', () => {
  const dataMock = {
    content: [
      {
        classificationId: 123,
        organizationId: 1,
        transferId: 456,
        label: 'RT_IUF',
        iuv: 'IUV001',
        iur: 'IUR001',
        iud: 'IUD001',
        iuf: 'IUF001',
        remittanceInformation: 'Some info',
        pspCompanyName: 'PSP Company'
      },
      {
        classificationId: 789,
        organizationId: 1,
        transferId: 101112,
        label: 'DOPPI',
        iuv: 'IUV002',
        iur: 'IUR002',
        iud: 'IUD002',
        iuf: 'IUF002',
        remittanceInformation: 'Other info',
        pspCompanyName: 'Other PSP'
      }
    ],
    size: 10,
    totalElements: 2,
    totalPages: 1,
    number: 0
  };

  const organizationId = 1;

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
    CLASSIFICATION_TYPE: 'RT_IUF',
    LAST_CLASSIFICATION_DATE_FROM: null,
    LAST_CLASSIFICATION_DATE_TO: null,
    REGULATION_DATE_FROM: null,
    REGULATION_DATE_TO: null,
    PAYMENT_DATE_FROM: null,
    PAYMENT_DATE_TO: null,
    ASSESSMENT_NAME: '',
    DEBT_TYPE: '',
    ASSESSMENT_STATUS: '',
    LAST_UPDATE_DATE_FROM: null,
    LAST_UPDATE_DATE_TO: null,
    ASSESSMENT_CODE: '',
    ASSESSMENT_DESCRIPTION: '',
    OFFICE_CODE: '',
    OFFICE_DESCRIPTION: '',
    SECTION_CODE: '',
    SECTION_DESCRIPTION: '',
    DEBT_POSITION_TYPE_ORG_CODE: '',
    OPERATING_YEAR: '',
    STATUS: ''
  };

  const request: ClassificationsFilteredRequest = {
    filters,
    pagination: { page: 0, size: 10 },
    sort: ['classificationId,asc']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data correctly', async () => {
    const mockQueryParams = {
      label: 'RT_IUF',
      iuv: 'IUV001',
      iur: 'IUR001',
      iud: 'IUD001',
      iuf: 'IUF001',
      page: 0,
      size: 10,
      sort: ['classificationId,asc']
    };

    (mapping.buildQueryParams as ReturnType<typeof vi.fn>).mockReturnValue(
      mockQueryParams
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
    expect(apiMock).toHaveBeenCalledWith(organizationId, mockQueryParams);
  });

  it('does not fetch data when organizationId is 0', () => {
    const { result } = renderHook(() =>
      getClassifications({ organizationId: 0 })
    );

    expect(result.current.data).toBeUndefined();
  });
});
