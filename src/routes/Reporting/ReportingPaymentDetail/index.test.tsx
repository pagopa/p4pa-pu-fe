import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMock } from 'zodock';
import { render, screen } from '@testing-library/react';
import ReportingPaymentDetail from '.';
import { useParams } from 'react-router';

import { getPaymentsReportingDetail } from '../../../api/getPaymentsReportingDetail';
import { paymentsReportingDetailDTOSchema } from '../../../../generated/zod-schema';
import { STATE } from '../../../store/types';
import { useStore } from '../../../store/GlobalStore';

const mockNavigate = vi.fn();

vi.mock('../../../api/getPaymentsReportingDetail', () => ({
  getPaymentsReportingDetail: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
  useParams: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  generatePath: vi.fn(),
  useLocation: vi.fn(),
  createBrowserRouter: vi.fn(),
  Navigate: vi.fn(({ to }) => ({
    type: 'div',
    props: { 'data-testid': 'navigate', children: `Navigate to ${to}` }
  })),
  Outlet: vi.fn()
}));

vi.mock('../../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: 'RESPONSES_ERROR',
    REPORTING_INDEX: 'REPORTING_INDEX',
    REPORTING_DETAIL: 'REPORTING_DETAIL',
    REPORTING_PAYMENT_DETAIL: 'REPORTING_PAYMENT_DETAIL'
  }
}));

describe('ReportingPaymentDetail Page', () => {
  const mockOrganizationId = '123';
  const mockIuf = 'iuf123';
  const mockId = '456';
  const mockData = createMock(paymentsReportingDetailDTOSchema);
  const mockUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockUseParams.mockReturnValue({
      iuf: mockIuf,
      id: mockId
    });
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockData,
      isLoading: false
    });
  });

  it('renders Reporting Payment Detail without crashing', () => {
    render(<ReportingPaymentDetail />);

    expect(
      screen.getByText('reportingPaymentDetail.title')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.summary')).toBeInTheDocument();
    expect(screen.getByText('commons.payment')).toBeInTheDocument();
  });

  it('shows loading indicator when data is loading', () => {
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: true
    });

    render(<ReportingPaymentDetail />);
  });

  it('displays payment data when available', () => {
    const customMockData = {
      ...mockData,
      iuv: 'IUV12345',
      iud: 'IUD67890',
      remittanceInformation: 'Pagamento tassa'
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: customMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    expect(screen.getByText('IUV12345')).toBeInTheDocument();
    expect(screen.getByText('IUD67890')).toBeInTheDocument();
    expect(screen.getByText('Pagamento tassa')).toBeInTheDocument();

    expect(screen.getByText('commons.auditor')).toBeInTheDocument();
  });

  it('calls getPaymentsReportingDetail with correct parameters', () => {
    render(<ReportingPaymentDetail />);

    expect(getPaymentsReportingDetail).toHaveBeenCalledWith(
      Number(mockOrganizationId),
      mockIuf,
      mockId
    );
  });

  it('handles null iuf and id parameters', () => {
    mockUseParams.mockReturnValue({
      iuf: undefined,
      id: undefined
    });

    render(<ReportingPaymentDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('handles API errors correctly', () => {
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API Error')
    });

    render(<ReportingPaymentDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('handles fisical person debtor type correctly', () => {
    const personMockData = {
      ...mockData,
      debtor: {
        ...mockData.debtor,
        entityType: 'F',
        fullName: 'Mario Rossi',
        fiscalCode: 'RSSMRA80A01H501U'
      }
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: personMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    const nameElements = screen.getAllByText(/Mario Rossi/);
    expect(nameElements.length).toBeGreaterThan(0);
    const fiscalCodeElements = screen.getAllByText(/RSSMRA80A01H501U/);
    expect(fiscalCodeElements.length).toBeGreaterThan(0);
    expect(screen.getByText('commons.payer')).toBeInTheDocument();
    const personTypeElements = screen.getAllByText(/\(commons\.person\)/);
    expect(personTypeElements.length).toBeGreaterThan(0);
  });

  it('handles company debtor type correctly', () => {
    const companyMockData = {
      ...mockData,
      debtor: {
        ...mockData.debtor,
        entityType: 'G',
        fullName: 'Azienda SRL',
        fiscalCode: '12345678901'
      }
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: companyMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    const companyElements = screen.getAllByText(/Azienda SRL/);
    expect(companyElements.length).toBeGreaterThan(0);

    const vatElements = screen.getAllByText(/12345678901/);
    expect(vatElements.length).toBeGreaterThan(0);

    expect(screen.getByText('commons.payer')).toBeInTheDocument();

    expect(screen.queryByText(/\(commons\.person\)/)).not.toBeInTheDocument();
  });

  it('handles null debtor data correctly', () => {
    const nullDebtorMockData = {
      ...mockData,
      debtor: null
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: nullDebtorMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    expect(
      screen.getByText('commons.fiscalCodeorVat commons.payer')
    ).toBeInTheDocument();

    expect(screen.getByText('commons.payer')).toBeInTheDocument();
  });

  it('formats payment date correctly when available', () => {
    const dateMockData = {
      ...mockData,
      paymentDateTime: '2023-04-15T14:30:00'
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: dateMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    expect(screen.getByText('15/04/2023')).toBeInTheDocument();
  });

  it('handles case when amountPaidCents is available', () => {
    const amountMockData = {
      ...mockData,
      amountPaidCents: 1500
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: amountMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    expect(screen.getByText('commons.amount')).toBeInTheDocument();

    const amountLabels = screen.getAllByText('commons.amount');
    expect(amountLabels.length).toBeGreaterThan(0);
  });

  it('handles case when amountPaidCents is not available', () => {
    const noAmountMockData = {
      ...mockData,
      amountPaidCents: null
    };

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: noAmountMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    const amountLabels = screen.getAllByText('commons.amount');
    expect(amountLabels.length).toBeGreaterThan(0);
  });

  it('handles missing or undefined parameters', () => {
    mockUseParams.mockReturnValue({});
    render(<ReportingPaymentDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });
});
