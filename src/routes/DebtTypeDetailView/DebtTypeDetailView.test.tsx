import { render, screen } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { DebtTypeDetailView } from './DebtTypeDetailView';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useParams } from 'react-router-dom';
import { getDebtPositionTypeOrgById } from '../../api/debtPositionsTypeOrg';
import { getDebtPositionTypeOrgOperators } from '../../api/debtPositionTypeOrgOperators';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn()
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: { ORGANIZATION_ID: 3 }
  })),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../api/debtPositionsTypeOrg', () => ({
  getDebtPositionTypeOrgById: vi.fn()
}));

vi.mock('../../api/debtPositionTypeOrgOperators', () => ({
  getDebtPositionTypeOrgOperators: vi.fn()
}));

vi.mock('../../api/debtTypesCreated', () => ({
  useDebtPositionTypeOrgSearch: vi.fn()
}));

describe('DebtTypeDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'debtTypeDetail.description': 'description',
      'commons.delete': 'delete',
      'commons.edit': 'edit',
      'debtTypeDetail.enabledOperators.selectedOperators': 'selected operators',
      'commons.operators': 'operators'
    });

    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      debtPositionTypeOrgId: '1'
    });

    (getDebtPositionTypeOrgById as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        response: {
          description: 'Test debt position ID',
          code: 'test',
          debtPositionTypeDescription:
            'Test debtPositionTypeDescription description'
        }
      },
      isLoading: false,
      isError: false,
      isSuccess: true
    });

    (
      getDebtPositionTypeOrgOperators as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        totalElements: 5
      },
      isError: false
    });

    (useDebtPositionTypeOrgSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        content: [
          {
            enabledOperators: 3
          }
        ]
      },
      mutate: vi.fn(),
      isError: false
    });
  });

  it('renders title and description', () => {
    render(<DebtTypeDetailView />);
    const description = screen.queryAllByText('Test debt position ID');
    expect(description.length).toBe(2);
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByText('selected operators')).toBeInTheDocument();
    expect(screen.getByText('3 operators')).toBeInTheDocument();
  });

  it('renders delete and edit buttons', () => {
    render(<DebtTypeDetailView />);
    expect(
      screen.getAllByRole('button', { name: 'delete' }).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole('button', { name: 'edit' }).length
    ).toBeGreaterThanOrEqual(1);
  });
});
