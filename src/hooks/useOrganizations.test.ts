import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import { useOrganizations } from './useOrganizations';
import utils from '../utils';
import * as OrganizationIdStore from '../store/OrganizationIdStore';
import * as OperatorRoleStore from '../store/OperatorRoleStore';
import { StoreProvider } from '../store/GlobalStore';

vi.mock('../utils', () => ({
  default: {
    loaders: {
      getOrganizations: vi.fn()
    }
  }
}));

vi.mock('../store/OrganizationIdStore', async () => {
  const actual = await vi.importActual('../store/OrganizationIdStore');
  return {
    ...actual,
    organizationIdState: { state: { value: undefined } },
    setOrganizationId: vi.fn()
  };
});

vi.mock('../store/OperatorRoleStore', async () => {
  const actual = await vi.importActual('../store/OperatorRoleStore');
  return {
    ...actual,
    operatorRoleState: { value: undefined },
    setOperatorRole: vi.fn()
  };
});

const mockIdToken = {
  organization: {
    fiscal_code: '12345678901',
    ipaCode: 'IPA001'
  }
};

vi.mock('../store/GlobalStore', async () => {
  const actual = await vi.importActual('../store/GlobalStore');
  return {
    ...actual,
    useStore: () => ({
      state: {
        organizationId: undefined,
        idToken: mockIdToken
      }
    })
  };
});

describe('useOrganizations', () => {
  const mockSetOrgId = OrganizationIdStore.setOrganizationId as Mock;
  const mockSetOpRole = OperatorRoleStore.setOperatorRole as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set organizationId and operatorRole when matching organization is found', () => {
    const mockData = [
      {
        orgFiscalCode: '12345678901',
        ipaCode: 'IPA001',
        organizationId: 1,
        operatorRole: 'ROLE_ADMIN'
      }
    ];

    (utils.loaders.getOrganizations as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      isSuccess: true
    });

    renderHook(() => useOrganizations(), {
      wrapper: StoreProvider
    });

    expect(mockSetOrgId).toHaveBeenCalledWith(1);
    expect(mockSetOpRole).toHaveBeenCalledWith('ROLE_ADMIN');
  });

  it('should handle empty organizations data', () => {
    (utils.loaders.getOrganizations as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: true
    });

    mockSetOrgId.mockClear();
    mockSetOpRole.mockClear();

    renderHook(() => useOrganizations());

    expect(mockSetOrgId).not.toHaveBeenCalled();
    expect(mockSetOpRole).not.toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    (utils.loaders.getOrganizations as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false
    });

    mockSetOrgId.mockClear();
    mockSetOpRole.mockClear();

    renderHook(() => useOrganizations());

    expect(mockSetOrgId).not.toHaveBeenCalled();
    expect(mockSetOpRole).not.toHaveBeenCalled();
  });

  it('should handle case when idToken has no organization info', () => {
    vi.mock('../store/GlobalStore', async () => {
      const actual = await vi.importActual('../store/GlobalStore');
      return {
        ...actual,
        useStore: () => ({
          state: {
            organizationId: undefined,
            idToken: null
          }
        })
      };
    });

    const mockData = [
      {
        orgFiscalCode: '99999999999',
        ipaCode: 'DIFF',
        organizationId: 3,
        operatorRole: 'ROLE_OPER'
      }
    ];

    (utils.loaders.getOrganizations as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      isSuccess: true
    });

    mockSetOrgId.mockClear();
    mockSetOpRole.mockClear();

    renderHook(() => useOrganizations());

    expect(mockSetOrgId).toHaveBeenCalledWith(3);
    expect(mockSetOpRole).toHaveBeenCalledWith('ROLE_OPER');
  });
});
