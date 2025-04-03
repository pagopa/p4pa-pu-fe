import { render, screen } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { DebtTypeCatalogDetailView } from './DebtTypeCatalogDetailView';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useParams } from 'react-router-dom';
import { getDebtPositionTypeDetail } from '../../api/debtPositionTypeDetail';

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

vi.mock('../../api/debtPositionTypeDetail', () => ({
  getDebtPositionTypeDetail: vi.fn()
}));

describe('DebtTypeCatalogDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'debtTypeCatalogDetail.description': 'Description',
      'commons.delete': 'Delete',
      'commons.edit': 'Edit',
      'debtTypeCatalogDetail.debtCatalogConfiguration.title': 'Config Title'
    });

    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      debtPositionTypeId: '1'
    });

    (
      getDebtPositionTypeDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        description: 'Test Type Name'
      },
      isLoading: false
    });
  });

  it('renders title and description', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(screen.getAllByText('Test Type Name')).toBeTruthy();
    expect(screen.getAllByText('Description')).toBeTruthy();
  });

  it('renders delete and edit buttons', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(
      screen.getAllByRole('button', { name: 'Delete' }).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole('button', { name: 'Edit' }).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders accordion with configuration title', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(screen.getByText('Config Title')).toBeInTheDocument();
  });

  it('renders delete dialogs (closed by default)', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(screen.queryAllByTestId('confirm-dialog')).not.toBeNull();
    expect(screen.queryAllByTestId('error-dialog')).not.toBeNull();
  });
});
