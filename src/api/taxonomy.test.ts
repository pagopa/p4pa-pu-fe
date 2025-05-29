import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { getTaxonomyDetail, synchronizeTaxonomy } from './taxonomy';
import { renderHook, waitFor } from '../__tests__/renderers';
import { Taxonomy, WorkflowCreatedDTO } from '../../generated/data-contracts';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        getTaxonomyDetail: vi.fn(),
        synchronizeTaxonomy: vi.fn()
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
