import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SubUnitsDataGrid } from './SubUnitsDataGrid';
import {
  OrgSubUnit,
  OrgSubUnitStatus,
  PagedOrgSubUnit
} from '@generated/core/data-contracts';

const formatDate = vi.fn((date: string, format: string) => `${date}|${format}`);
vi.mock('@core/utils/formatters', () => ({
  formatDate: (date: string, format: string) => formatDate(date, format)
}));

vi.mock('@pagopa/mui-italia', () => ({
  MIChip: ({ label, color }: { label: string; color?: string }) => (
    <span data-testid="mi-chip" data-color={color}>
      {label}
    </span>
  )
}));

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

describe('SubUnitsDataGrid', () => {
  it('falls back to an empty rows array and 0 total pages when data is missing', () => {
    render(<SubUnitsDataGrid data={{} as PagedOrgSubUnit} />);

    expect(screen.getByTestId('row-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('0');
  });

  it('builds the row id from organizationId + subUnitCode', () => {
    render(
      <SubUnitsDataGrid
        data={{ content: [baseRow], totalPages: 3 } as PagedOrgSubUnit}
      />
    );

    // organizationId (number) + subUnitCode (string) coerces to "1ABC"
    expect(screen.getByTestId('row-1ABC')).toBeInTheDocument();
    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
  });

  it('formats the creation date', () => {
    render(
      <SubUnitsDataGrid data={{ content: [baseRow] } as PagedOrgSubUnit} />
    );

    expect(formatDate).toHaveBeenCalledWith('2024-12-19', 'dd MMMM yyyy');
  });

  it('renders a status chip with the mapped color, and nothing when status is missing', () => {
    const rows = [
      { ...baseRow, subUnitCode: 'A', status: OrgSubUnitStatus.ACTIVE },
      { ...baseRow, subUnitCode: 'B', status: OrgSubUnitStatus.CANCELLED },
      { ...baseRow, subUnitCode: 'C', status: undefined }
    ];

    render(<SubUnitsDataGrid data={{ content: rows } as PagedOrgSubUnit} />);

    expect(
      screen
        .getByTestId('cell-status-1A')
        .querySelector('[data-testid="mi-chip"]')
    ).toHaveAttribute('data-color', 'default');
    expect(
      screen
        .getByTestId('cell-status-1B')
        .querySelector('[data-testid="mi-chip"]')
    ).toHaveAttribute('data-color', 'neutral');
    expect(screen.getByTestId('cell-status-1C')).toBeEmptyDOMElement();
  });

  it('renders an accessible action button', () => {
    render(
      <SubUnitsDataGrid data={{ content: [baseRow] } as PagedOrgSubUnit} />
    );

    expect(
      screen.getByRole('button', { name: 'commons.toDetail' })
    ).toBeInTheDocument();
  });
});
