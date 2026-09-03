import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import * as appStateStore from '../../../store/AppStateStore';
import { PageRoutes } from '../..';

// Mock react-router all at once
vi.mock('react-router', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    useParams: vi.fn(),
    generatePath: vi.fn()
  };
});

import { useBreadcrumbs } from './useBreadcrumbs';
import { useParams, generatePath } from 'react-router';
import { OperatorsDetail } from '../../../../generated/core/data-contracts';

describe('useBreadcrumbs', () => {
  const mockSetCustomBreadcrumbsItems = vi.spyOn(
    appStateStore,
    'setCustomBreadcrumbsItems'
  );
  const mockUseParams = useParams as unknown as ReturnType<typeof vi.fn>;
  const mockGeneratePath = generatePath as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mocks
    mockUseParams.mockReturnValue({ organizationId: '42' });
    mockGeneratePath.mockImplementation(
      (path, params) => `${path}/${params.organizationId}/${params.orgName}`
    );
  });

  it('sets breadcrumbs including operator detail when isSuccess true', () => {
    renderHook(() =>
      useBreadcrumbs({
        isSuccess: true,
        data: {
          operatorName: 'Maria',
          operatorLastName: 'Rossi',
          orgName: 'TestOrg'
        } as OperatorsDetail
      })
    );

    expect(mockSetCustomBreadcrumbsItems).toHaveBeenCalledWith([
      { pathname: PageRoutes.OPERATORS_LIST, id: 'OPERATORS_LIST' },
      {
        pathname: `${PageRoutes.BROKER_OPERATORS}/42/TestOrg`,
        label: 'TestOrg',
        id: 'BROKER_OPERATORS'
      },
      {
        pathname: '',
        label: 'Maria Rossi',
        id: 'OPERATORS_DETAIL'
      }
    ]);
  });

  it('sets breadcrumbs without operator detail when isSuccess false', () => {
    renderHook(() =>
      useBreadcrumbs({
        isSuccess: false,
        data: { orgName: 'TestOrg' } as OperatorsDetail
      })
    );

    expect(mockSetCustomBreadcrumbsItems).toHaveBeenCalledWith([
      { pathname: PageRoutes.OPERATORS_LIST, id: 'OPERATORS_LIST' },
      {
        pathname: `${PageRoutes.BROKER_OPERATORS}/42/TestOrg`,
        label: 'TestOrg',
        id: 'BROKER_OPERATORS'
      }
    ]);
  });

  it('handles missing orgName param', () => {
    mockUseParams.mockReturnValue({ organizationId: '42', orgName: undefined });

    renderHook(() =>
      useBreadcrumbs({
        isSuccess: true,
        data: {
          operatorName: 'Maria',
          operatorLastName: 'Rossi',
          orgName: undefined
        } as OperatorsDetail
      })
    );

    expect(mockSetCustomBreadcrumbsItems).toHaveBeenCalledWith([
      { pathname: PageRoutes.OPERATORS_LIST, id: 'OPERATORS_LIST' },
      {
        pathname: '',
        label: 'Maria Rossi',
        id: 'OPERATORS_DETAIL'
      }
    ]);
  });
});
