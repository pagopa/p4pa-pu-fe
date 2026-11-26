import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import type { PagedTaxonomy } from '../../../generated/core/client';
import TaxonomyDataGrid from './TaxonomyDataGrid';
import { PageRoutes } from '..';

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
  totalPages: undefined as number | undefined,
  loading: false
}));

vi.mock('../../components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    totalPages,
    loading
  }: {
    rows: Array<Record<string, unknown>>;
    columns: typeof grid.columns;
    totalPages?: number;
    loading?: boolean;
  }) => {
    grid.columns = columns;
    grid.rows = rows;
    grid.totalPages = totalPages;
    grid.loading = Boolean(loading);
    return (
      <div data-testid="custom-data-grid">
        <span data-testid="rows-count">{rows.length}</span>
        <span data-testid="loading">{String(Boolean(loading))}</span>
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

const data: PagedTaxonomy = {
  content: [
    {
      taxonomyId: 7,
      taxonomyCode: 'TAX-7'
    }
  ],
  totalPages: 2,
  totalElements: 1,
  size: 10,
  number: 0
} as PagedTaxonomy;

describe('TaxonomyDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grid.columns = [];
    grid.rows = [];
    grid.totalPages = undefined;
    grid.loading = false;
  });

  it('renders data and loading state', () => {
    render(<TaxonomyDataGrid data={data} isLoading />);

    expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(grid.totalPages).toBe(2);
    expect(grid.loading).toBe(true);
  });

  it('falls back to an empty list when content is missing', () => {
    render(
      <TaxonomyDataGrid
        data={{ ...data, content: undefined } as unknown as PagedTaxonomy}
      />
    );

    expect(screen.getByTestId('rows-count')).toHaveTextContent('0');
    expect(grid.totalPages).toBe(2);
  });

  it('navigates to the taxonomy detail when the detail button is clicked', () => {
    render(<TaxonomyDataGrid data={data} />);

    fireEvent.click(
      screen.getByRole('button', { name: /taxonomyPage.accessibleTitle/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        String(PageRoutes.BACKOFFICE_TAXONOMY_DETAIL).split('/')[1]
      )
    );
    expect(mockNavigate.mock.calls[0][0]).toContain('7');
  });
});
