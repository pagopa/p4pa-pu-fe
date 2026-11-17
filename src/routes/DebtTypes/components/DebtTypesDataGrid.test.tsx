import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../__tests__/renderers';
import type { PagedDebtPositionTypeWithCount } from '../../../../generated/core/data-contracts';
import DebtTypesDataGrid from './DebtTypesDataGrid';
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
        {rows.map((row, index) =>
          columns
            .filter((column) => column.renderCell)
            .map((column) => (
              <div
                key={`${column.field}-${index}`}
                data-testid={`cell-${column.field}-${index}`}
              >
                {
                  column.renderCell!({
                    row,
                    value: row[column.field],
                    field: column.field
                  }) as React.ReactNode
                }
              </div>
            ))
        )}
      </div>
    );
  }
}));

const buildData = (
  content: Array<Record<string, unknown>>
): PagedDebtPositionTypeWithCount =>
  ({
    content,
    totalElements: content.length,
    size: 10,
    number: 0,
    totalPages: 2
  }) as unknown as PagedDebtPositionTypeWithCount;

describe('DebtTypesDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grid.columns = [];
    grid.rows = [];
    grid.totalPages = undefined;
  });

  it('renders the update date when present and the fallback page count', () => {
    render(
      <DebtTypesDataGrid
        data={
          {
            content: [
              {
                debtPositionTypeId: 1,
                description: 'Type 1',
                updateDate: '2024-01-01T10:00:00Z'
              }
            ]
          } as unknown as PagedDebtPositionTypeWithCount
        }
      />
    );

    expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
    expect(grid.rows).toHaveLength(1);
    expect(screen.getByTestId('cell-updateDate-0')).toHaveTextContent(
      '01/01/2024'
    );
  });

  it('renders an empty update date when the value is missing', () => {
    render(
      <DebtTypesDataGrid
        data={buildData([
          {
            debtPositionTypeId: 2,
            description: 'Type 2',
            updateDate: undefined
          }
        ])}
      />
    );

    expect(screen.getByTestId('cell-updateDate-0')).toHaveTextContent('');
  });

  it('falls back to an empty list when content is missing', () => {
    render(
      <DebtTypesDataGrid
        data={
          {
            content: undefined
          } as unknown as PagedDebtPositionTypeWithCount
        }
      />
    );

    expect(screen.getByTestId('rows-count')).toHaveTextContent('0');
  });

  it('navigates to the debt type catalog detail on click', () => {
    render(
      <DebtTypesDataGrid
        data={buildData([{ debtPositionTypeId: 3, description: 'Type 3' }])}
      />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /debtTypeCatalogDetail.accessibleTitle/i
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        String(PageRoutes.DEBT_TYPE_CATALOG_DETAIL).split('/')[1]
      )
    );
    expect(mockNavigate.mock.calls[0][0]).toContain('3');
  });
});
