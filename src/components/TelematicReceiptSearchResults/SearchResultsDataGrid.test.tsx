import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { fireEvent, render, waitFor, screen } from '../../__tests__/renderers';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { getReceipts } from '../../api/receipts';
import SearchResultsDataGrid from './SearchResultsDataGrid';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

vi.mock('../../api/receipts', () => ({
  getReceipts: vi.fn()
}));

describe('TelematicReceiptSearchResults Datagrid', () => {
  const mockNavigate = vi.fn();

  const mockData = {
    content: [
      {
        receiptId: 83,
        paymentAmountCents: 1,
        paymentDateTime: '2025-02-01T09:22:07.645',
        installmentId: 176,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013300000022785712301',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/83'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/83'
          }
        }
      },
      {
        receiptId: 84,
        paymentAmountCents: 2,
        paymentDateTime: '2025-02-02T09:22:07.645',
        installmentId: 177,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013301200002278700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/84'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/84'
          }
        }
      },
      {
        receiptId: 85,
        paymentAmountCents: 40,
        paymentDateTime: '2025-02-03T09:33:07.645',
        installmentId: 178,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013301290002278700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/85'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/85'
          }
        }
      },
      {
        receiptId: 86,
        paymentAmountCents: 4,
        paymentDateTime: '2025-02-04T09:22:07.645',
        installmentId: 179,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF65013300000022785700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/86'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/86'
          }
        }
      },
      {
        receiptId: 87,
        paymentAmountCents: 5,
        paymentDateTime: '2025-02-05T09:22:07.645',
        installmentId: 180,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013300070022785700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/87'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/87'
          }
        }
      },
      {
        receiptId: 88,
        paymentAmountCents: 6,
        paymentDateTime: '2025-02-06T09:22:07.645',
        installmentId: 181,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013300000022785900001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/88'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/88'
          }
        }
      },
      {
        receiptId: 89,
        paymentAmountCents: 7,
        paymentDateTime: '2025-02-07T09:22:07.645',
        installmentId: 182,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05056300000022785700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/89'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/89'
          }
        }
      },
      {
        receiptId: 90,
        paymentAmountCents: 8888,
        paymentDateTime: '2025-02-08T09:22:07.645',
        installmentId: 183,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013375900022785700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/90'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/90'
          }
        }
      },
      {
        receiptId: 91,
        paymentAmountCents: 5464,
        paymentDateTime: '2025-02-09T09:22:07.645',
        installmentId: 184,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013300000022799900001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/91'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/91'
          }
        }
      },
      {
        receiptId: 92,
        paymentAmountCents: 765,
        paymentDateTime: '2025-02-10T09:22:07.645',
        installmentId: 185,
        receiptOrigin: 'RECEIPT_PAGOPA',
        iuv: 'RF05013300444022785700001',
        debtPositionTypeOrgDescription: 'Test for Create Debt Position',
        _links: {
          self: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/92'
          },
          receiptView: {
            href: 'http://p4pa-debt-positions-microservice-chart:8080/crud/receipts-view/92'
          }
        }
      }
    ],
    size: 10,
    totalElements: 12,
    totalPages: 2,
    number: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    (getReceipts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData
    });
    setOrganizationId(3);
  });

  it('displays data in the grid', async () => {
    const { container } = render(<SearchResultsDataGrid />);

    await waitFor(() => {
      expect(container.querySelector('[data-field="iuv"]')).toBeDefined();
    });
  });

  it('calls getReceipts with correct parameters', () => {
    render(<SearchResultsDataGrid />);

    expect(getReceipts).toHaveBeenCalledWith(expect.any(Number), {
      receiptOrigin: 'RECEIPT_PAGOPA',
      flowFileTypes: ['RECEIPT_PAGOPA'],
      page: 0,
      size: 10
    });
  });

  it('handles page size change correctly', async () => {
    render(<SearchResultsDataGrid />);

    const pageSizeSelect = screen.getByTestId('result-set-select');

    fireEvent.mouseDown(pageSizeSelect);

    const selectChangeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(selectChangeEvent, 'target', {
      value: { value: 20 }
    });

    pageSizeSelect.dispatchEvent(selectChangeEvent);

    await waitFor(() => {
      expect(getReceipts).toHaveBeenCalledTimes(1);
    });
  });

  it('updates filters state when pagination changes', async () => {
    const { container } = render(<SearchResultsDataGrid />);

    expect(getReceipts).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        receiptOrigin: 'RECEIPT_PAGOPA',
        flowFileTypes: ['RECEIPT_PAGOPA'],
        page: 0,
        size: 10
      })
    );

    const pageSizeSelect = container.querySelector(
      '[aria-label="Rows per page"]'
    );
    if (pageSizeSelect) {
      fireEvent.mouseDown(pageSizeSelect);
      const option = screen.getByText('20');
      fireEvent.click(option);

      await waitFor(() => {
        expect(getReceipts).toHaveBeenCalledWith(
          expect.any(Number),
          expect.objectContaining({
            receiptOrigin: 'RECEIPT_PAGOPA',
            flowFileTypes: ['RECEIPT_PAGOPA'],
            page: 0,
            size: 20
          })
        );
      });
    }
  });

  it('renders grid with data when data is available', async () => {
    (getReceipts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData
    });

    const { container } = render(<SearchResultsDataGrid />);

    await waitFor(() => {
      const firstRow = mockData.content[0];
      expect(
        container.querySelector(`[data-id="${firstRow.receiptId}"]`)
      ).toBeDefined();
    });
  });

  it('renders empty grid when data is undefined', async () => {
    (getReceipts as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined
    });

    const { container } = render(<SearchResultsDataGrid />);

    await waitFor(() => {
      expect(container.querySelector('.MuiDataGrid-overlay')).toHaveTextContent(
        'No rows'
      );
    });
  });
});
