import { ManagedOrgs } from './ManagedOrgs';
import { useManagedOrgsSearch } from '../../../api/debtTypesCreated';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { createMock } from 'zodock';
import { pagedOrganizationWithDebtPositionTypeOrgCountSchema } from '../../../../generated/zod-schema';

vi.mock('../../../api/debtTypesCreated', () => ({
  useManagedOrgsSearch: vi.fn()
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      ORGANIZATION_ID: 3,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('ManagedOrgs', () => {
  const mutateMock = vi.fn();
  const onSearchMock = vi.fn();

  beforeEach(() => {
    i18nTestSetup({
      'debtTypesCreated.managedOrganizationsDataGrid.IPACode': 'IPA Code',
      'debtTypesCreated.managedOrganizationsDataGrid.managedOrg':
        'Managed Organization',
      'debtTypesCreated.managedOrganizationsDataGrid.debtTypesSet':
        'Debt Types Set'
    });

    vi.resetAllMocks();

    const baseMock = createMock(
      pagedOrganizationWithDebtPositionTypeOrgCountSchema
    );

    const dataMock = {
      ...baseMock,
      content: [
        {
          organizationId: 1,
          ipaCode: 'IPA001',
          organizationName: 'Organization 1',
          debtPositionTypeOrgCount: 5
        },
        {
          organizationId: 2,
          ipaCode: 'IPA002',
          organizationName: 'Organization 2',
          debtPositionTypeOrgCount: 10
        }
      ],
      totalPages: 1
    };

    (
      useManagedOrgsSearch as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutate: mutateMock,
      data: dataMock
    });
  });

  it('should render data grid with correct columns', async () => {
    render(<ManagedOrgs IPACodeFilter="" onSearch={onSearchMock} />);

    await waitFor(() => {
      expect(
        screen.getByRole('columnheader', { name: /IPA Code/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Managed Organization/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: /Debt Types Set/i })
      ).toBeInTheDocument();
    });
  });

  it('should render data rows correctly', async () => {
    render(<ManagedOrgs IPACodeFilter="" onSearch={onSearchMock} />);

    await waitFor(() => {
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();

      expect(within(grid).queryAllByText('IPA001').length).toBeGreaterThan(0);
      expect(
        within(grid).queryAllByText('Organization 1').length
      ).toBeGreaterThan(0);
      expect(within(grid).queryAllByText('5').length).toBeGreaterThan(0);
      expect(within(grid).queryAllByText('IPA002').length).toBeGreaterThan(0);
      expect(
        within(grid).queryAllByText('Organization 2').length
      ).toBeGreaterThan(0);
      expect(within(grid).queryAllByText('10').length).toBeGreaterThan(0);
    });
  });

  it('should register search function', () => {
    render(<ManagedOrgs IPACodeFilter="test-ipa" onSearch={onSearchMock} />);

    expect(onSearchMock).toHaveBeenCalled();
  });

  it('should update filters when props change', async () => {
    const { rerender } = render(
      <ManagedOrgs IPACodeFilter="" onSearch={onSearchMock} />
    );

    mutateMock.mockClear();

    rerender(<ManagedOrgs IPACodeFilter="new-ipa" onSearch={onSearchMock} />);

    expect(mutateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          organizationName: 'new-ipa'
        })
      })
    );

    const searchFn = onSearchMock.mock.calls[0][0];
    searchFn();

    expect(mutateMock).toHaveBeenCalled();
  });
});
