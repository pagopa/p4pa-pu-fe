import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DebtPositionsInstallmentDetail } from './DebtPositionsInstallmentDetail';
import debtPositions from '../../api/debtPositions';
import { useNavigate, generatePath, useParams } from 'react-router-dom';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  generatePath: vi.fn(),
  useParams: vi.fn()
}));

vi.mock('../../api/debtPositions', () => ({
  default: { getInstallmentDetail: vi.fn() }
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

describe('DebtPositionsInstallmentDetail', () => {
  const mockNavigate = vi.fn();
  const mockOrganizationId = '123';
  const mockInstallmentId = '288';

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

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      id: mockInstallmentId
    });
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });
    (generatePath as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => '/mock-path'
    );

    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockPaidInstallment });
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
    // expect(screen.getByText('commons.chipStatus.PAID')).toBeInTheDocument();

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
});
