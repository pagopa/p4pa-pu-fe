import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { useParams } from 'react-router-dom';
import { getPaymentsReportingRows } from '../../api/reporting';
import ReportingDetail from './ReportingDetail';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';

i18nTestSetup({
  'reportingDetail.reportingIdOrIUF': 'Reporting ID/IUF',
  'reportingDetail.regulationId': 'Regulation ID',
  'commons.summary': 'Summary',
  'commons.payments': 'Payments',
  'commons.detail': 'Detail',
  'commons.filters.filterResults': 'Filter',
  'commons.files.downloadFlow': 'Download Flow',
  'commons.searchIUV': 'Search IUV'
});

vi.mock('../../api/reporting', () => ({
  getPaymentsReportingRows: vi.fn()
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: vi.fn()
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

describe('ReportingDetail Page', () => {
  const mockData = {
    iuf: 'TEST-IUF-123',
    regulationUniqueIdentifier: 'REG-123',
    regulationDate: '2023-01-01',
    payDate: '2023-01-02',
    acquiringDate: '2023-01-03',
    iuv: 'IUV123',
    iur: 'IUR123',
    transferIndex: 1,
    pspIdentifier: 'PSP001',
    flowDateTime: '2023-01-01T12:00:00.000Z',
    senderPspType: 'TYPE1',
    senderPspCode: 'CODE1',
    totalPayments: 10,
    totalAmountCents: 10000,
    amountPaidCents: 10000,
    paymentOutcomeCode: 'PAID',
    ingestionFlowFileId: 1,
    organizationId: 123,
    paymentsReportingId: 'PR001'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      id: mockData.iuf
    });

    (
      getPaymentsReportingRows as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: {
        content: [mockData],
        totalPages: 1,
        totalElements: 1
      },
      isLoading: false
    });
  });

  it('renders Reporting Detail without crashing', () => {
    render(<ReportingDetail />);

    expect(screen.getAllByText(mockData.iuf)).toHaveLength(2);
    expect(
      screen.getByText(mockData.regulationUniqueIdentifier)
    ).toBeInTheDocument();

    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();

    expect(screen.getByLabelText('results-table')).toBeInTheDocument();

    expect(screen.getByText('Filter')).toBeInTheDocument();

    expect(screen.getByText('Download Flow')).toBeInTheDocument();
  });

  it('applies filters when filter button is clicked', async () => {
    render(<ReportingDetail />);

    const searchInput = screen.getByRole('textbox', {
      name: 'Search IUV'
    });
    fireEvent.change(searchInput, { target: { value: 'TEST-IUV' } });

    const filterButton = screen.getByText('Filter');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(getPaymentsReportingRows).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(String),
        expect.objectContaining({ iuv: 'TEST-IUV' }),
        expect.any(Object)
      );
    });
  });
});
