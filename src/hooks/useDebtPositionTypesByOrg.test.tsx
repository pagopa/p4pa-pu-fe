import { useDebtPositionTypesByOrg } from './useDebtPositionTypesByOrg';
import { getDebtPositionTypesByOrganizationId } from '../api/debtPositionsTypes';
import utils from '../utils';
import { AxiosError } from 'axios';
import { Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';

// Mock API call module
vi.mock('../api/debtPositionsTypes', () => ({
  getDebtPositionTypesByOrganizationId: vi.fn()
}));

// Mock utils.notify.emit
vi.mock('../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
  }
}));

describe('useDebtPositionTypesByOrg', () => {
  const orgId = 1;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call API with organizationId', () => {
    (getDebtPositionTypesByOrganizationId as Mock).mockReturnValue({
      isError: false,
      error: null,
      data: []
    });

    const { result } = renderHook(() =>
      useDebtPositionTypesByOrg({ organizationId: orgId })
    );

    expect(getDebtPositionTypesByOrganizationId).toHaveBeenCalledWith({
      organizationId: orgId
    });
    expect(result.current.isError).toBe(false);
  });

  it('should emit notification on non-server error', async () => {
    const error = {
      response: { status: 400 }
    } as AxiosError;

    (getDebtPositionTypesByOrganizationId as Mock).mockReturnValue({
      isError: true,
      error,
      data: null
    });

    renderHook(() => useDebtPositionTypesByOrg({ organizationId: orgId }));

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'errors.fetchDebtPositionsTypes',
        'error'
      );
    });
  });

  it('should NOT emit notification on server error (status >= 500)', async () => {
    const error = {
      response: { status: 500 }
    } as AxiosError;

    (getDebtPositionTypesByOrganizationId as Mock).mockReturnValue({
      isError: true,
      error,
      data: null
    });

    renderHook(() => useDebtPositionTypesByOrg({ organizationId: orgId }));

    await waitFor(() => {
      expect(utils.notify.emit).not.toHaveBeenCalled();
    });
  });
});
