import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import { MyOrg } from './MyOrg';
import { useDebtPositionTypeOrgSearch } from '../../../api/debtTypesCreated';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { useNavigate, generatePath } from 'react-router-dom';

vi.mock('../../../api/debtTypesCreated', () => ({
  useDebtPositionTypeOrgSearch: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    useNavigate: vi.fn(),
    generatePath: vi.fn()
  };
});

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

describe('MyOrg', () => {
  const mutateMock = vi.fn();
  const onSearchMock = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    i18nTestSetup({
      'debtTypesCreated.myOrganizationDataGrid.code': 'Code',
      'debtTypesCreated.myOrganizationDataGrid.description': 'Description',
      'debtTypesCreated.myOrganizationDataGrid.lastUpdateDate': 'Last Update',
      'debtTypesCreated.myOrganizationDataGrid.enabledOperators':
        'Enabled Operators'
    });

    vi.resetAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    (generatePath as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );
    (
      useDebtPositionTypeOrgSearch as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutate: mutateMock,
      data: {
        content: [
          {
            debtPositionTypeOrgId: 1,
            code: 'CODE1',
            description: 'Description 1',
            updateDate: '2023-01-01T12:00:00Z',
            enabledOperators: 3
          },
          {
            debtPositionTypeOrgId: 2,
            code: 'CODE2',
            description: 'Description 2',
            updateDate: '2023-02-01T12:00:00Z',
            enabledOperators: 5
          }
        ],
        totalPages: 1
      }
    });
  });

  it('should render data grid with correct columns', async () => {
    render(
      <MyOrg codeFilter="" descriptionFilter="" onSearch={onSearchMock} />
    );

    await waitFor(() => {
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Last Update')).toBeInTheDocument();
      expect(screen.getByText('Enabled Operators')).toBeInTheDocument();
    });
  });

  it('should render data rows correctly', async () => {
    render(
      <MyOrg codeFilter="" descriptionFilter="" onSearch={onSearchMock} />
    );

    await waitFor(() => {
      expect(screen.getByText('CODE1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('CODE2')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('should register search function', () => {
    render(
      <MyOrg
        codeFilter="test-code"
        descriptionFilter="test-desc"
        onSearch={onSearchMock}
      />
    );

    expect(onSearchMock).toHaveBeenCalled();
  });

  it('should update filters when props change', async () => {
    const { rerender } = render(
      <MyOrg codeFilter="" descriptionFilter="" onSearch={onSearchMock} />
    );

    mutateMock.mockClear();

    rerender(
      <MyOrg
        codeFilter="new-code"
        descriptionFilter="new-desc"
        onSearch={onSearchMock}
      />
    );

    expect(mutateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          code: 'new-code',
          description: 'new-desc'
        })
      })
    );

    const searchFn = onSearchMock.mock.calls[0][0];
    searchFn();

    expect(mutateMock).toHaveBeenCalled();
  });
});
