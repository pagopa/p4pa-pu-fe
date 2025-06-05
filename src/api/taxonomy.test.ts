import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { getTaxonomies, getTaxonomyDetail, synchronizeTaxonomy } from './taxonomy';
import { renderHook, waitFor } from '../__tests__/renderers';
import { Taxonomy, WorkflowCreatedDTO } from '../../generated/data-contracts';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        getTaxonomyDetail: vi.fn(),
        synchronizeTaxonomy: vi.fn(),
        getTaxonomies: vi.fn()
      }
    }
  };
});

describe('get Taxonomy Detail ', () => {
  it('returns data correctly', async () => {
    const dataMock: Taxonomy = {
      creationDate: '2025-02-20T09:23:17.977642',
      updateDate: '2025-05-27T17:23:33.402746',
      updateOperatorExternalId: 'WS_USER',
      updateTraceId: 'ecc6c6bf5df88ea1c3500676734d173e',
      taxonomyId: 705,
      organizationType: '10',
      organizationTypeDescription: "AUTORITA' AMMINISTRATIVE INDIPENDENTI",
      macroAreaCode: '15',
      macroAreaName: 'Autorità Idrica',
      macroAreaDescription: 'Settore idrico',
      serviceTypeCode: '100',
      serviceType: 'tassa concorso',
      serviceTypeDescription: 'tassa per la partecipazione ai concorsi',
      collectionReason: 'TS',
      startDateValidity: '2024-08-01T00:00:00.000000',
      endDateOfValidity: '2080-01-01T00:00:00.000000',
      taxonomyCode: '9/1004100TS/',
      _links: {
        self: {
          href: 'http://:8080/crud/taxonomies/705'
        },
        taxonomy: {
          href: 'http://:8080/crud/taxonomies/705'
        }
      }
    };

    const params = { taxonomyId: 705 };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTaxonomyDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getTaxonomyDetail(params.taxonomyId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(params.taxonomyId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('synchronizeTaxonomy', () => {
  it('should call synchronizeTaxonomy and return data', async () => {
    const dataMock: WorkflowCreatedDTO = {
      workflowId: 'SynchronizeTaxonomyPagoPaFetchWF-ON-DEMAND',
      runId: '01971768-1993-7287-8993-4218439ea77a'
    };
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'synchronizeTaxonomy')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => synchronizeTaxonomy());

    await result.current.mutateAsync();

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(result.current.data).toEqual(dataMock);
    expect(apiMock).toHaveBeenCalled();
  });
});

describe('get Taxonomies list', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      content: [
        {
            creationDate: "2025-05-09T00:00:06.538816",
            updateDate: "2025-06-05T00:00:03.126757",
            updateOperatorExternalId: "WS_USER-piattaforma-unitaria_",
            updateTraceId: "df85c28f842f4d9db77e4073a74627c4",
            taxonomyId: 1408,
            organizationType: "07",
            organizationTypeDescription: "PUBBLICHE AMMINISTRAZIONI CENTRALI",
            macroAreaCode: "14",
            macroAreaName: "MIPAAF",
            macroAreaDescription: "Ministero delle Politiche Agricole",
            serviceTypeCode: "139",
            serviceType: "Recuperi, restituzioni e rimborsi",
            serviceTypeDescription: "Entrate eventuali e diverse concernenti il ministero",
            collectionReason: "AP",
            startDateValidity: "2024-01-10T00:00:00.000000",
            endDateOfValidity: "2080-01-01T00:00:00.000000",
            taxonomyCode: "9/0714139AP/",
            _links: {
                self: {
                    href: "8"
                },
                taxonomy: {
                    href: ""
                }
            }
        },
        {
            creationDate: "2025-02-20T09:23:18.447160",
            updateDate: "2025-02-20T11:01:39.055530",
            updateOperatorExternalId: "EUqKiD1psLrGNuLxCGzriy-royPlBvuyeJMc0dxaxNs=",
            updateTraceId: "-",
            taxonomyId: 890,
            organizationType: "01",
            organizationTypeDescription: "COMUNE/UNIONE DI COMUNI / CONSORZI",
            macroAreaCode: "14",
            macroAreaName: "TRIBUTI",
            macroAreaDescription: "Rappresentano le maggiori entrate dell'Ente",
            serviceTypeCode: "108",
            serviceType: "Canone Unico Patrimoniale - CORPORATE",
            serviceTypeDescription: "Altre imposte locali",
            collectionReason: "TS",
            startDateValidity: "2021-01-04T00:00:00.000000",
            endDateOfValidity: "2080-01-01T00:00:00.000000",
            taxonomyCode: "0101108TS",
            _links: {
                self: {
                    href: ""
                },
                taxonomy: {
                    href: ""
                }
            }
        },
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const query = {macroAreaCode: "14"};

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getTaxonomies')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getTaxonomies());    

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

});

