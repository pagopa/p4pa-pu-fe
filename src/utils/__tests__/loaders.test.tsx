import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  OperatorRoleEnum,
  OrganizationDTO
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
          ipaCode: 'IPA01',
          orgName: 'Test Org',
          operatorRole: OperatorRoleEnum.ROLE_ADMIN,
          orgFiscalCode: '123456789',
          flagNotifyIo: false,
          flagNotifyOutcomePush: false,
          flagPaymentNotification: false,
        }
      ];

      getOrganizationsMock.mockResolvedValueOnce({
        data: mockOrganizations
      } as AxiosResponse<Array<OrganizationDTO>>);

      const { result } = renderHook(() => loaders.getOrganizations());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(getOrganizationsMock).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockOrganizations);
      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('should redirect to error page when API call fails', async () => {
      getOrganizationsMock.mockRejectedValueOnce(new Error('API Error'));

      renderHook(() => loaders.getOrganizations());

      await waitFor(() => {
        expect(window.location.replace).toHaveBeenCalledWith(
          '/piattaformaunitaria/error'
        );
      });

      expect(getOrganizationsMock).toHaveBeenCalledTimes(1);
    });
  });
});
