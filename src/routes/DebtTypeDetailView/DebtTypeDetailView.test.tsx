import { render, screen } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { DebtTypeDetailView } from './DebtTypeDetailView';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useParams } from 'react-router-dom';
import { getDebtPositionTypeOrgById } from '../../api/debtPositionsTypeOrg';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn()
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

describe('DebtTypeDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'debtTypeDetail.description': 'description',
      'commons.delete': 'delete',
      'commons.edit': 'edit'
    });

    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      debtPositionTypeOrgId: '1'
    });

    (
      getDebtPositionTypeOrgById as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        description: 'Test debt position ID'
      },
      isLoading: false
    });
  });

  it('renders title and description', () => {
    render(<DebtTypeDetailView />);
    expect(screen.getAllByText('Test debt position ID')).toBeTruthy();
    expect(screen.getByText('description')).toBeInTheDocument();
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
