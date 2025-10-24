import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  OperatorRole,
  OrganizationDTO,
  OrganizationStatus
} from '../../../generated/data-contracts';
import { AxiosResponse } from 'axios';
import { renderHook, waitFor } from '../../__tests__/renderers';
import utils from '../index';
import loaders from '../loaders';

const getOrganizationsMock = vi.fn();

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
});
