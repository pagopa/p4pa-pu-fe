import { render, screen } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { DebtTypeCatalogDetailView } from './DebtTypeCatalogDetailView';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useParams } from 'react-router';
import { getDebtPositionTypeDetail } from '../../api/debtPositionTypeDetail';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
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

  describe('technical debt type (UNKNOWN) delete restriction', () => {
    it('disables delete buttons when debtPositionTypeId from the response is < 0', () => {
      (
        getDebtPositionTypeDetail as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: { description: 'UNKNOWN', debtPositionTypeId: -1 },
        isLoading: false
      });

      render(<DebtTypeCatalogDetailView />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
      deleteButtons.forEach((button) => expect(button).toBeDisabled());
    });

    it('keeps delete buttons enabled when debtPositionTypeId from the response is >= 0', () => {
      (
        getDebtPositionTypeDetail as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: { description: 'Standard', debtPositionTypeId: 5 },
        isLoading: false
      });

      render(<DebtTypeCatalogDetailView />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
      deleteButtons.forEach((button) => expect(button).not.toBeDisabled());
    });

    it('keeps delete buttons enabled when debtPositionTypeId is missing', () => {
      render(<DebtTypeCatalogDetailView />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      deleteButtons.forEach((button) => expect(button).not.toBeDisabled());
    });
  });
});
