import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '../../../__tests__/renderers';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import { generatePath, useNavigate } from 'react-router';
import type {
  OrgSubUnit,
  PagedOrgSubUnit
} from '../../../../generated/core/client';
import { PageRoutes } from '@core/routes';
import SubUnitDataGrid from './SubUnitDataGrid';

const formatDate = vi.fn((date: string) => `formatted:${date}`);

vi.mock('@core/utils', () => ({
  default: {
    formatters: {
      formatDate: (date: string) => formatDate(date)
    }
  }
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

vi.mock('@core/routes', () => ({
  PageRoutes: {
    SUB_UNIT_DETAIL: '/organizations/:organizationId/subunits/:subUnitCode'
  }
}));

vi.mock(
  '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer',
  () => ({
    default: (props: { description: string }) => (
      <div data-testid="empty-detail-container">{props.description}</div>
    )
  })
);

type Action = ReactElement<{ label: string; onClick: () => void }>;
type Column = {
  field: string;
  headerName?: string;
  renderCell?: (params: { value: unknown; row: OrgSubUnit }) => React.ReactNode;
  getActions?: (params: { id: string; row: OrgSubUnit }) => Array<Action>;
};

vi.mock('../../../components/DataGrid/CustomDataGrid', () => ({
  default: (props: {
    rows: Array<OrgSubUnit>;
    columns: Array<Column>;
    getRowId: (row: OrgSubUnit) => string;
    totalPages: number;
  }) => {
    const Cell = ({ col, row }: { col: Column; row: OrgSubUnit }) => {
      if (col.renderCell) {
        return (
          <>
            {col.renderCell({ value: row[col.field as keyof OrgSubUnit], row })}
          </>
        );
      }
      if (col.getActions) {
        return (
          <>
            {col.getActions({ id: row.subUnitCode, row }).map((action) => (
              <button key={action.key} onClick={action.props.onClick}>
                {action.props.label}
              </button>
            ))}
          </>
        );
      }
      return <>{row[col.field as keyof OrgSubUnit] as React.ReactNode}</>;
    };

    return (
      <div data-testid="custom-data-grid">
        <span data-testid="total-pages">{props.totalPages}</span>
        {props.columns.map((column) => (
          <span key={column.field} data-testid={`header-${column.field}`}>
            {column.headerName}
          </span>
        ))}
        {props.rows.map((row) => (
          <div key={row.subUnitCode} data-testid={`row-${row.subUnitCode}`}>
            {props.columns.map((column) => (
              <div
                key={column.field}
                data-testid={`cell-${row.subUnitCode}-${column.field}`}
              >
                <Cell col={column} row={row} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}));

describe('SubUnitDataGrid', () => {
  const mockOnDelete = vi.fn();
  const mockNavigate = vi.fn();
  const sampleRow = {
    organizationId: 123,
    subUnitCode: 'SUB-001',
    subUnitType: 'AOO',
    subUnitName: 'Payments Office',
    creationDate: '2024-12-19',
    status: 'ACTIVE'
  } as OrgSubUnit;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders the empty state when the response has no rows', () => {
    render(
      <SubUnitDataGrid
        id=""
        data={
          {
            content: [],
            totalPages: 0,
            size: 10,
            totalElements: 0,
            number: 0
          } as PagedOrgSubUnit
        }
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('empty-detail-container')).toHaveTextContent(
      'OperatorDetail.subUnitEmptyData'
    );
    expect(screen.queryByTestId('custom-data-grid')).not.toBeInTheDocument();
  });

  it('renders rows, translated headers, total pages, and row ids', () => {
    render(
      <SubUnitDataGrid
        id=""
        data={{ content: [sampleRow], totalPages: 3 } as PagedOrgSubUnit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('header-subUnitCode')).toHaveTextContent(
      'OperatorDetail.subCode'
    );
    expect(screen.getByTestId('header-subUnitType')).toHaveTextContent(
      'OperatorDetail.subType'
    );
    expect(screen.getByTestId('header-subUnitName')).toHaveTextContent(
      'OperatorDetail.subName'
    );
    expect(screen.getByTestId('header-creationDate')).toHaveTextContent(
      'OperatorDetail.subCreationDate'
    );
    expect(screen.getByTestId('header-status')).toHaveTextContent(
      'OperatorDetail.subStatus'
    );
    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
    expect(screen.getByTestId('row-SUB-001')).toBeInTheDocument();
    expect(screen.getByTestId('cell-SUB-001-subUnitName')).toHaveTextContent(
      'Payments Office'
    );
  });

  it('formats the creation date and renders the translated status chip', () => {
    render(
      <SubUnitDataGrid
        id=""
        data={{ content: [sampleRow], totalPages: 1 } as PagedOrgSubUnit}
        onDelete={mockOnDelete}
      />
    );

    expect(formatDate).toHaveBeenCalledWith('2024-12-19');
    expect(screen.getByTestId('cell-SUB-001-creationDate')).toHaveTextContent(
      'formatted:2024-12-19'
    );
    expect(screen.getByTestId('cell-SUB-001-status')).toHaveTextContent(
      'OperatorDetail.subUnitStatus.ACTIVE'
    );
  });

  it('calls onDelete with the selected row', () => {
    render(
      <SubUnitDataGrid
        id=""
        data={{ content: [sampleRow], totalPages: 1 } as PagedOrgSubUnit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.remove' }));

    expect(mockOnDelete).toHaveBeenCalledWith(sampleRow);
  });

  it('navigates to the sub-unit detail when the detail action is clicked', () => {
    render(
      <SubUnitDataGrid
        id=""
        data={{ content: [sampleRow], totalPages: 1 } as PagedOrgSubUnit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'commons.toDetail' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.SUB_UNIT_DETAIL, {
        organizationId: sampleRow.organizationId,
        subUnitCode: sampleRow.subUnitCode
      })
    );
  });

  it('uses an empty rows array when data is undefined', () => {
    render(<SubUnitDataGrid id="" onDelete={mockOnDelete} />);

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('total-pages')).toHaveTextContent('1');
    expect(screen.queryByTestId('row-SUB-001')).not.toBeInTheDocument();
  });
});
