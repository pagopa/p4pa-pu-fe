/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '../../../__tests__/renderers';
import { useNavigate, useParams } from 'react-router';
import { getPaymentsReportingRows } from '../../../api/reporting';
import ReportingDetail from './ReportingDetail';
import utils from '../../../utils';
import { PageRoutes } from '../../../routes';

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

vi.mock('../../../api/reporting', () => ({
  getPaymentsReportingRows: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => children,
    generatePath: vi.fn().mockReturnValue('/mock-path')
  };
});

vi.mock('../../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 3,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../../utils', async () => {
  const actualUtils: any = await vi.importActual('../../../utils');
  return {
    ...actualUtils,
    default: {
      ...actualUtils.default,
      URI: {
        decode: vi.fn(() => ({ iuv: '' }))
      }
    }
  };
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockMutateAsync = vi.fn((_filters: any) =>
  Promise.resolve({
    data: { content: [mockData], totalPages: 1, totalElements: 1 }
  })
);

vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: { content: [mockData], totalPages: 1, totalElements: 1 },
      isLoading: false,
      isPending: false,
      isError: false,
      error: null,
      mutateAsync: mockMutateAsync
    },
    applyFilters: (filters: any) =>
      mockMutateAsync({ filters, pagination: { page: 0, size: 10 }, sort: [] })
  }))
}));

describe('ReportingDetail Page', () => {
  const mockUseParams = vi.mocked(useParams);
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockDecode = utils.URI.decode as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ id: mockData.iuf });
    (getPaymentsReportingRows as unknown as Mock).mockReturnValue({
      data: {
        content: [mockData],
        totalPages: 1,
        totalElements: 1
      },
      isLoading: false
    });
    mockDecode.mockReturnValue({ iuv: '' });

    const navigateMock = vi.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
  });

  it('renders Reporting Detail without crashing and displays content', () => {
    render(<ReportingDetail />);

    expect(screen.getAllByText(mockData.iuf)).toHaveLength(2); // header and summary
    expect(
      screen.getByText(mockData.regulationUniqueIdentifier)
    ).toBeInTheDocument();

    expect(screen.getByText('commons.summary')).toBeInTheDocument();
    expect(screen.getByText('commons.payments')).toBeInTheDocument();
    expect(screen.getByText('commons.detail')).toBeInTheDocument();

    expect(screen.getByLabelText('results-table')).toBeInTheDocument();

    expect(
      screen.getByText('commons.filters.filterResults')
    ).toBeInTheDocument();

    expect(screen.getByText('commons.files.downloadFlow')).toBeInTheDocument();
  });

  it('applies filters when filter button is clicked', async () => {
    render(<ReportingDetail />);

    const searchInput = screen.getByRole('textbox', {
      name: 'commons.searchIUV'
    });
    fireEvent.change(searchInput, { target: { value: 'TEST-IUV' } });

    const filterButton = screen.getByText('commons.filters.filterResults');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ iuv: 'TEST-IUV' }),
          pagination: expect.any(Object),
          sort: expect.any(Array)
        })
      );
    });
  });

  it('redirects to error page if id param is missing', () => {
    const navigateMock = vi.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseParams.mockReturnValue({ id: undefined });

    const { container } = render(<ReportingDetail />);
    expect(container.innerHTML).toBe(''); // returns null immediately
    expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('redirects to error page if reportingRows query errors', async () => {
    const { useSearch } = await import('../../../hooks/useSearch');
    (useSearch as any).mockReturnValue({
      query: {
        isError: true,
        error: new Error('Error fetching data'),
        mutateAsync: mockMutateAsync
      },
      applyFilters: vi.fn()
    });

    const navigateMock = vi.fn();
    mockUseNavigate.mockReturnValue(navigateMock);

    render(<ReportingDetail />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });
});
