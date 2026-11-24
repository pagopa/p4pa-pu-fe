import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@core/__tests__/renderers';
import { generatePath, useNavigate } from 'react-router';

import { PageRoutes } from '@core/routes';
import { OrgSubUnitStatus } from '@generated/core/data-contracts';
import { SubUnitsDataGrid } from './SubUnitsDataGrid';
import type {
  OrgSubUnit,
  PagedOrgSubUnit
} from '@generated/core/data-contracts';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('@core/components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    getRowId,
    totalPages
  }: {
    rows: Array<OrgSubUnit>;
    columns: Array<{
      field: string;
      renderCell?: (params: { row: OrgSubUnit }) => React.ReactNode;
    }>;
    getRowId: (row: OrgSubUnit) => string;
    totalPages: number;
  }) => (
    <div>
      <span data-testid="total-pages">{totalPages}</span>
      <span data-testid="row-count">{rows.length}</span>
      {rows.map((row) => (
        <div key={getRowId(row)} data-testid={`row-${getRowId(row)}`}>
          {columns.map((col) => (
            <div
              key={col.field}
              data-testid={`cell-${col.field}-${getRowId(row)}`}
            >
              {col.renderCell
                ? col.renderCell({ row })
                : (row[col.field as keyof OrgSubUnit] as string)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}));

const baseRow: OrgSubUnit = {
  organizationId: 1,
  subUnitCode: 'ABC',
  subUnitType: 'AOO',
  subUnitName: 'Test Sub Unit',
  creationDate: '2024-12-19'
} as OrgSubUnit;

const mockNavigate = vi.fn();

describe('SubUnitsDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('falls back to an empty rows array and 0 total pages when data is missing', () => {
    render(
      <SubUnitsDataGrid data={{} as PagedOrgSubUnit} organizationId={1} />
    );

    expect(screen.getByTestId('row-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('0');
  });

  it('builds the row id from organizationId + subUnitCode', () => {
    render(
      <SubUnitsDataGrid
        organizationId={1}
        data={{ content: [baseRow], totalPages: 3 } as PagedOrgSubUnit}
      />
    );

    // organizationId (number) + subUnitCode (string) coerces to "1ABC"
    expect(screen.getByTestId('row-1ABC')).toBeInTheDocument();
    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
  });

  it('renders an accessible action button', () => {
    render(
      <SubUnitsDataGrid
        organizationId={1}
        data={{ content: [baseRow] } as PagedOrgSubUnit}
      />
    );

    expect(
      screen.getByRole('button', { name: 'commons.toDetail' })
    ).toBeInTheDocument();
  });

  it('renders a chip when the row has a status', () => {
    render(
      <SubUnitsDataGrid
        organizationId={1}
        data={
          {
            content: [{ ...baseRow, status: OrgSubUnitStatus.ACTIVE }]
          } as PagedOrgSubUnit
        }
      />
    );

    expect(
      screen.getByText(`subunits.status.${OrgSubUnitStatus.ACTIVE}`)
    ).toBeInTheDocument();
  });

  it('navigates to the sub unit detail when the action button is clicked', () => {
    render(
      <SubUnitsDataGrid
        organizationId={1}
        data={{ content: [baseRow] } as PagedOrgSubUnit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.toDetail' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.SUB_UNIT_DETAIL, {
        organizationId: String(1),
        subUnitCode: 'ABC'
      })
    );
  });
});
