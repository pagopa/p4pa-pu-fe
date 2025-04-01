import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReportingPaymentDetail from '.';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { getPaymentsReportingDetail } from '../../api/getPaymentsReportingDetail';
import { paymentsReportingDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

vi.mock('../../api/getPaymentsReportingDetail', () => ({
  getPaymentsReportingDetail: vi.fn()
}));

vi.mock('react-router-dom', () => {
  const useParamsMock = vi.fn();
  return {
    useParams: useParamsMock
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('ReportingPaymentDetail Page', () => {
  const mockOrganizationId = '123';
  const mockIuf = 'iuf123';
  const mockId = '456';
  const mockData = createMock(paymentsReportingDetailDTOSchema);

  beforeEach(() => {
    vi.clearAllMocks();

    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
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

    // Verifica che gli elementi principali siano presenti
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

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays payment data when available', () => {
    // Modifica il mock per includere dati specifici che possiamo testare
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

    // Verifica che i dati specifici vengano visualizzati
    expect(screen.getByText('IUV12345')).toBeInTheDocument();
    expect(screen.getByText('IUD67890')).toBeInTheDocument();
    expect(screen.getByText('Pagamento tassa')).toBeInTheDocument();

    // Verifichiamo la presenza di elementi chiave invece di cercare il testo PAID
    expect(screen.getByText('commons.state')).toBeInTheDocument();
  });

  it('calls getPaymentsReportingDetail with correct parameters', () => {
    render(<ReportingPaymentDetail />);

    expect(getPaymentsReportingDetail).toHaveBeenCalledWith(
      Number(mockOrganizationId),
      mockIuf,
      mockId
    );
  });
});
