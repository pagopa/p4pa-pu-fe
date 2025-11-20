import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import { PagedReceiptView } from '../../../generated/data-contracts';
import { STATE } from '../../store/types';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';

const { mockNavigate, mockMutateAsync, mockGeneratePath } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockMutateAsync: vi.fn(),
  mockGeneratePath: vi.fn(
    (_, params) => `/telematic-receipts/${params?.receiptId}`
  )
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
  generatePath: mockGeneratePath
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: { [STATE.ORGANIZATION_ID]: 123 }
  }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../api/receiptPdf', () => ({
  getReceiptPdf: () => ({
    mutateAsync: mockMutateAsync
  })
}));

vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/test-deploy-path'
    }
  }
}));

vi.mock('../../components/ActionMenu/ActionMenu', () => ({
  default: ({
    menuItems
  }: {
    menuItems: Array<{ label: string; action: () => void }>;
  }) => (
    <div data-testid="action-menu">
      {menuItems.map((item) => (
        <button
          key={item.label}
          type="button"
          data-testid={`action-${item.label}`}
          onClick={item.action}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../../components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    getRowId,
    totalPages
  }: {
    rows: Array<Record<string, unknown>>;
    columns: Array<{
      field: string;
      renderCell?: (params: {
        row: Record<string, unknown>;
        value?: unknown;
      }) => React.ReactNode;
    }>;
    getRowId: (row: Record<string, unknown>) => string | number;
    totalPages: number;
  }) => (
    <div data-testid="custom-data-grid">
      <div data-testid="rows-count">{`${rows.length} rows`}</div>
      <div data-testid="columns-count">{`${columns.length} columns`}</div>
      <div data-testid="first-row-id">
        {rows.length > 0 ? getRowId(rows[0]) : 'no-rows'}
      </div>
      <div data-testid="total-pages">{`pages: ${totalPages}`}</div>
      {rows.map((row, rowIndex) => (
        <div key={getRowId(row)} data-testid={`row-${rowIndex}`}>
          {columns.map((column) => (
            <div key={column.field} data-testid={`cell-${column.field}`}>
              {column.renderCell
                ? column.renderCell({ row, value: row[column.field] })
                : (row[column.field] as React.ReactNode)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}));

const mockData = {
  content: [
    {
      iuv: 'IUV-001',
      iud: 'IUD-001',
      paymentAmountCents: 12345,
      debtPositionTypeOrgDescription: 'Tipo A',
      paymentDateTime: '2024-01-01T00:00:00Z',
      receiptId: 10
    },
    {
      iuv: 'IUV-002',
      iud: 'IUD-002',
      paymentAmountCents: 67890,
      debtPositionTypeOrgDescription: 'Tipo B',
      paymentDateTime: '2024-02-02T00:00:00Z',
      receiptId: 20
    }
  ],
  totalElements: 2,
  totalPages: 3,
  number: 0,
  size: 10
} as unknown as PagedReceiptView;

describe('SearchResultsDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePath.mockClear();
    mockMutateAsync.mockReset();
    vi.mocked(downloadBlob).mockClear();
    vi.mocked(utils.notify.emit).mockClear();
  });

  it('renders rows, columns and total pages correctly', () => {
    render(<SearchResultsDataGrid data={mockData} />);

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('rows-count').textContent).toBe('2 rows');
    expect(screen.getByTestId('columns-count').textContent).toBe('5 columns');
    expect(screen.getByTestId('first-row-id').textContent).toBe('IUD-001');
    expect(screen.getByTestId('total-pages').textContent).toBe('pages: 3');
  });

  it('handles empty data gracefully', () => {
    render(
      <SearchResultsDataGrid data={undefined as unknown as PagedReceiptView} />
    );

    expect(screen.getByTestId('rows-count').textContent).toBe('0 rows');
    expect(screen.getByTestId('columns-count').textContent).toBe('5 columns');
    expect(screen.getByTestId('first-row-id').textContent).toBe('no-rows');
    expect(screen.getByTestId('total-pages').textContent).toBe('pages: 1');
  });

  it('navigates to receipt detail when the action is clicked', () => {
    render(<SearchResultsDataGrid data={mockData} />);

    const detailButtons = screen.getAllByTestId('action-commons.detail');
    fireEvent.click(detailButtons[0]);

    expect(mockGeneratePath).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ receiptId: 10 })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/telematic-receipts/10');
  });

  it('downloads the receipt PDF when the action succeeds', async () => {
    const mockBlob = new Blob(['test']);
    mockMutateAsync.mockResolvedValueOnce({
      data: mockBlob,
      fileName: 'receipt-10.pdf'
    });

    render(<SearchResultsDataGrid data={mockData} />);

    const downloadButtons = screen.getAllByTestId(
      'action-commons.files.download'
    );
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(10));
    expect(downloadBlob).toHaveBeenCalledWith(mockBlob, 'receipt-10.pdf');
  });

  it('shows an error notification if the download fails', async () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockMutateAsync.mockRejectedValueOnce(new Error('download failed'));

    render(<SearchResultsDataGrid data={mockData} />);

    const downloadButtons = screen.getAllByTestId(
      'action-commons.files.download'
    );
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(10));
    expect(utils.notify.emit).toHaveBeenCalledWith(
      'commons.files.downloadFailed',
      'error'
    );
    consoleSpy.mockRestore();
  });
});
