import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../__tests__/renderers';
import type {
  InstallmentViewDTO,
  PagedInstallmentView
} from '../../../../generated/core/data-contracts';
import { IUVDataGrid, stateColors } from './DebtPositionIUVDataGrid';
import { PageRoutes } from '../../../routes';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate
}));

const grid = vi.hoisted(() => ({
  columns: [] as Array<{
    field: string;
    renderCell?: (params: unknown) => unknown;
    valueGetter?: (value: unknown, row: unknown) => unknown;
  }>,
  rows: [] as Array<Record<string, unknown>>,
  totalPages: undefined as number | undefined
}));

vi.mock('../../../components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    totalPages
  }: {
    rows: Array<Record<string, unknown>>;
    columns: typeof grid.columns;
    totalPages: number;
  }) => {
    grid.columns = columns;
    grid.rows = rows;
    grid.totalPages = totalPages;
    return (
      <div data-testid="custom-data-grid">
        <span data-testid="rows-count">{rows.length}</span>
        <span data-testid="total-pages">{String(totalPages)}</span>
        {rows[0] &&
          columns
            .filter((column) => column.renderCell)
            .map((column) => (
              <div key={column.field} data-testid={`cell-${column.field}`}>
                {
                  column.renderCell!({
                    row: rows[0],
                    value: rows[0][column.field],
                    field: column.field
                  }) as React.ReactNode
                }
              </div>
            ))}
      </div>
    );
  }
}));

const buildRow = (
  overrides: Partial<InstallmentViewDTO> = {}
): InstallmentViewDTO =>
  ({
    installmentId: 1,
    debtPositionId: 10,
    paymentOptionId: 20,
    iuv: 'IUV-1',
    status: 'PAID',
    dueDate: '2024-01-01',
    amountCents: 1234,
    remittanceInformation: 'Fallback remittance',
    debtorFiscalCodeHash: 'hash',
    debtPositionTypeOrgDescription: 'Description',
    ...overrides
  }) as InstallmentViewDTO;

const buildData = (
  content: Array<InstallmentViewDTO>
): PagedInstallmentView => ({
  content,
  size: content.length,
  totalElements: content.length,
  totalPages: 3,
  number: 0
});

describe('DebtPositionIUVDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grid.columns = [];
    grid.rows = [];
    grid.totalPages = undefined;
  });

  it('renders only rows with an installment id and exposes the total pages', () => {
    const validRow = buildRow();
    const invalidRow = buildRow({ installmentId: undefined, iuv: 'NO-ID' });

    render(<IUVDataGrid data={buildData([invalidRow, validRow])} />);

    expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
  });

  it('renders an empty grid with one page when data is missing', () => {
    render(<IUVDataGrid />);

    expect(screen.getByTestId('rows-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
  });

  it('falls back to remittanceInformation when original remittance is missing', () => {
    const row = buildRow({ originalRemittanceInformation: undefined });
    render(<IUVDataGrid data={buildData([row])} />);

    const subjectColumn = grid.columns.find(
      (column) => column.field === 'originalRemittanceInformation'
    );
    expect(subjectColumn?.valueGetter?.('', row)).toBe('Fallback remittance');
  });

  it('prefers originalRemittanceInformation when present', () => {
    const row = buildRow({ originalRemittanceInformation: 'Original' });
    render(<IUVDataGrid data={buildData([row])} />);

    const subjectColumn = grid.columns.find(
      (column) => column.field === 'originalRemittanceInformation'
    );
    expect(subjectColumn?.valueGetter?.('', row)).toBe('Original');
  });

  it('formats amount, due date and status cells', () => {
    render(<IUVDataGrid data={buildData([buildRow()])} />);

    expect(screen.getByTestId('cell-amountCents')).toBeInTheDocument();
    expect(screen.getByTestId('cell-dueDate')).toBeInTheDocument();
    expect(screen.getByTestId('cell-status')).toBeInTheDocument();
    expect(screen.getByText('IUV-1')).toBeInTheDocument();
  });

  it('navigates to the installment detail when the action is clicked', () => {
    render(<IUVDataGrid data={buildData([buildRow()])} />);

    fireEvent.click(screen.getByRole('button', { name: 'commons.goToDetail' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        String(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL).split('/')[1]
      )
    );
    expect(mockNavigate.mock.calls[0][0]).toContain('1');
  });

  it('maps every installment status to a chip color', () => {
    expect(stateColors.PAID).toBe('success');
    expect(stateColors.UNPAID).toBe('info');
    expect(stateColors.CANCELLED).toBe('error');
  });
});
