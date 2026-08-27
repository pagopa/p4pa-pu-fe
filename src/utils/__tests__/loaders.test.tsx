import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  OperatorRole,
  OrganizationDTO,
  OrganizationStatus
} from '../../../generated/core/data-contracts';
import { AxiosResponse } from 'axios';
import { renderHook, waitFor } from '../../__tests__/renderers';
import utils from '../index';
import loaders from '../loaders';

const getOrganizationsMock = vi.fn();
const resourcesUrl = utils.config.resourcesUrl;

beforeEach(() => {
  vi.resetAllMocks();

  vi.spyOn(utils.apiClient.bff, 'getOrganizations').mockImplementation(
    getOrganizationsMock
  );

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { replace: vi.fn() }
  });

  vi.spyOn(utils.config, 'deployPath', 'get').mockReturnValue(
    '/piattaformaunitaria'
  );
});

afterEach(() => {
  utils.config.resourcesUrl = resourcesUrl;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('loaders', () => {
  describe('getOrganizations', () => {
    it('should fetch organizations successfully', async () => {
      const mockOrganizations: Array<OrganizationDTO> = [
        {
          organizationId: 1,
          brokerId: 100,
          ipaCode: 'IPA01',
          orgName: 'Test Org',
          operatorRole: OperatorRole.ROLE_ADMIN,
          orgFiscalCode: '123456789',
          flagNotifyIo: false,
          flagNotifyOutcomePush: false,
          flagPaymentNotification: false,
          status: OrganizationStatus.ACTIVE
        }
      ];

      getOrganizationsMock.mockResolvedValueOnce({
        data: mockOrganizations
      } as AxiosResponse<Array<OrganizationDTO>>);

      const { result } = renderHook(() => loaders.getOrganizations());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(getOrganizationsMock).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockOrganizations);
    });

    it('should have isError to true when API call fails', async () => {
      getOrganizationsMock.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => loaders.getOrganizations());

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useResourceContent', () => {
    beforeEach(() => {
      utils.config.resourcesUrl =
        'https://example.com/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md';
    });

    it('should fetch resource content from the resolved URL', async () => {
      const textMock = vi.fn().mockResolvedValue('Terms and conditions');
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/markdown' }),
        text: textMock
      } as unknown as Response);
      vi.stubGlobal('fetch', fetchMock);

      const { result } = renderHook(() =>
        loaders.useResourceContent('tos', 'en-US', 'broker-external-id')
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com/broker-external-id/tos/en_tos.md'
      );
      expect(textMock).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('Terms and conditions');
    });

    it('should not fetch resource content without broker externalId', () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const { result } = renderHook(() =>
        loaders.useResourceContent('pp', 'it', '')
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
