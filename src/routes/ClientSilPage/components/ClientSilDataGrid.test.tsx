import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import { ClientSilDataGrid } from './ClientSilDataGrid';
import type { ClientDTOPage } from '../../../../generated/apiClient';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../../components/DataGrid/CustomDataGrid', () => {
  return {
    default: ({
      rows,
      columns,
      getRowId,
      loading,
      totalPages
    }: {
      rows: Array<Record<string, unknown>>;
      columns: Array<{
        field: string;
        renderCell?: (params: {
          row: Record<string, unknown>;
        }) => React.ReactElement;
      }>;
      getRowId: (row: Record<string, unknown>) => string;
      loading: boolean;
      totalPages?: number;
    }) => (
      <div data-testid="custom-data-grid">
        <div>Loading: {loading.toString()}</div>
        <div>Rows count: {rows.length}</div>
        <div>Total pages: {totalPages || 1}</div>
        {rows.map((row) => (
          <div key={getRowId(row)} data-testid={`row-${getRowId(row)}`}>
            {columns.map((col) => (
              <span key={col.field} data-testid={`cell-${col.field}`}>
                {col.renderCell
                  ? col.renderCell({ row })
                  : (row[col.field] as string)}
              </span>
            ))}
          </div>
        ))}
      </div>
    )
  };
});

vi.mock('@mui/icons-material', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/icons-material')>()),
  ChevronRight: () => <div data-testid="chevron-right">→</div>
}));

const mockClientData: ClientDTOPage = {
  content: [
    {
      clientId: 'client-1',
      clientName: 'Test Client 1',
      organizationIpaCode: 'ORG001'
    },
    {
      clientId: 'client-2',
      clientName: 'Test Client 2',
      organizationIpaCode: 'ORG002'
    }
  ],
  totalElements: 2,
  totalPages: 1,
  pageNo: 0,
  pageSize: 10
};

describe('ClientSilDataGrid', () => {
  const mockOnRowClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (
    props: Partial<Parameters<typeof ClientSilDataGrid>[0]> = {}
  ) => {
    return render(
      <ClientSilDataGrid
        data={mockClientData}
        loading={false}
        onRowClick={mockOnRowClick}
        {...props}
      />
    );
  };

  it('should render correctly with data', () => {
    renderComponent();

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByText('Rows count: 2')).toBeInTheDocument();
    expect(screen.getByText('Loading: false')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    renderComponent({ loading: true });

    expect(screen.getByText('Loading: true')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    renderComponent({ data: undefined });

    expect(screen.getByText('Rows count: 0')).toBeInTheDocument();
  });

  it('should call onRowClick when action button is clicked', () => {
    renderComponent();

    const actionButtons = screen.getAllByRole('button', {
      name: 'commons.detail'
    });
    fireEvent.click(actionButtons[0]);

    expect(mockOnRowClick).toHaveBeenCalledWith({
      clientId: 'client-1',
      clientName: 'Test Client 1',
      organizationIpaCode: 'ORG001'
    });
  });

  it('should render data correctly in cells', () => {
    renderComponent();

    expect(screen.getByText('Test Client 1')).toBeInTheDocument();
    expect(screen.getByText('Test Client 2')).toBeInTheDocument();
    expect(screen.getByText('client-1')).toBeInTheDocument();
    expect(screen.getByText('client-2')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    const emptyData: ClientDTOPage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNo: 0,
      pageSize: 10
    };

    renderComponent({ data: emptyData });

    expect(screen.getByText('Rows count: 0')).toBeInTheDocument();
  });

  it('should pass totalPages correctly to CustomDataGrid', () => {
    const dataWithMultiplePages: ClientDTOPage = {
      ...mockClientData,
      totalPages: 5
    };

    renderComponent({ data: dataWithMultiplePages });

    expect(screen.getByText('Total pages: 5')).toBeInTheDocument();
  });

  it('should default to 1 page when totalPages is not provided', () => {
    const dataWithoutTotalPages: ClientDTOPage = {
      ...mockClientData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalPages: undefined as any
    };

    renderComponent({ data: dataWithoutTotalPages });

    expect(screen.getByText('Total pages: 1')).toBeInTheDocument();
  });
});
