import { fireEvent, render, screen } from '../../__tests__/renderers';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { DebtPositionsInstallmentDetail } from './DebtPositionsInstallmentDetail';
import debtPositions from '../../api/debtPositions';
import { useLocation, useParams } from 'react-router-dom';
import { setOrganizationId } from '../../store/OrganizationIdStore';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  generatePath: vi.fn(),
  useParams: vi.fn(),
  useLocation: vi.fn(),
  createBrowserRouter: vi.fn(),
  Navigate: vi.fn(({ to }) => ({
    type: 'div',
    props: { 'data-testid': 'navigate', children: `Navigate to ${to}` }
  }))
}));

vi.mock('../../api/debtPositions', () => ({
  default: { getInstallmentDetail: vi.fn() }
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: { ORGANIZATION_ID: 3, customBreadcrumbsItems: [] },
    setState: vi.fn()
  })),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('DebtPositionsInstallmentDetail', () => {
  const mockOrganizationId = 123;
  const mockUseParams = vi.mocked(useParams);
  const mockPaidInstallment = {
    installmentId: 288,
    paymentOptionId: 301,
    status: 'PAID',
    debtor: {
      entityType: 'F',
      fiscalCode: 'RSSMRA92A12B123A',
      fullName: 'Mario Rossi'
    },
    payer: {
      entityType: 'F',
      fiscalCode: 'BNCMRA80A01H501X',
      fullName: 'Mario Bianchi'
    },
    pspCompanyName: 'Payment Service Provider',
    iud: '123456789012345',
    iur: '987654321098765',
    debtPositionTypeOrgDescription: 'Test for Create Debt Position',
    debtPositionDescription: 'Debt Position Description',
    debtPositionId: 239
  };

  const mockUnpaidInstallment = {
    ...mockPaidInstallment,
    status: 'UNPAID',
    paymentDateTime: undefined,
    payer: undefined,
    pspCompanyName: undefined,
    iud: undefined,
    iur: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ id: '123' });

    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockPaidInstallment });

    (useLocation as Mock).mockReturnValue({
      state: {
        remittanceInformation: 'test remittanceInformation'
      }
    });
    setOrganizationId(mockOrganizationId);
  });

  it('renders the component with correct title', () => {
    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.getByText('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')
    ).toBeInTheDocument();
  });

  it('shows PAID installment', () => {
    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('commons.state')).toBeInTheDocument();

    expect(screen.getByText('commons.paymentInformation')).toBeInTheDocument();
    expect(screen.getByText('commons.paymentdate')).toBeInTheDocument();
    expect(screen.getByText('commons.executedBy')).toBeInTheDocument();
    expect(screen.getByText('Mario Bianchi')).toBeInTheDocument();
    expect(screen.getByText('commons.transactionManager')).toBeInTheDocument();
    expect(screen.getByText('Payment Service Provider')).toBeInTheDocument();
    expect(screen.getByText('commons.debtor')).toBeInTheDocument();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(
      screen.getByText('RSSMRA92A12B123A (commons.person)')
    ).toBeInTheDocument();
    expect(screen.queryByText('commons.noPaymentMade')).toBeNull();
  });

  it('shows UNPAID installment', () => {
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockUnpaidInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('commons.noPaymentMade')).toBeInTheDocument();
    expect(screen.queryByText('commons.paymentInformation')).toBeNull();
  });

  it('opens and closes the drawer when clicking the filter button', () => {
    render(<DebtPositionsInstallmentDetail />);

    const showMore = screen.getByText('commons.showOtherBeneficiaries');
    expect(showMore).toBeDefined();

    const drawerTitle = screen.getByText(
      'debtPositionInstallmentDetail.drawer.title'
    );
    expect(drawerTitle).not.toBeVisible();

    fireEvent.click(showMore);
    expect(drawerTitle).toBeVisible();
  });
});
