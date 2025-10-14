/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import OperatorDetailDataGrid from './OperatorDetailDataGrid';
import { PagedDebtPositionTypeOrgDTO } from '../../../../generated/apiClient';
import utils from '../../../utils';

vi.mock('../../../utils', () => ({
  default: {
    dialog: {
      open: vi.fn(),
      close: vi.fn()
    }
  }
}));

vi.mock('./ActionMenu', () => ({
  GridActionMenu: (props: any) => {
    return (
      <div data-testid={`grid-action-menu-${props.row.debtPositionTypeOrgId}`}>
        <button
          onClick={() => props.onDelete(props.row)}
          data-testid={`delete-button-${props.row.debtPositionTypeOrgId}`}
          aria-label="Delete"
        >
          Delete
        </button>
      </div>
    );
  }
}));

vi.mock(
  '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer',
  () => ({
    default: (props: any) => (
      <div data-testid="empty-detail-container">{props.description}</div>
    )
  })
);

vi.mock('../../../components/DataGrid/CustomDataGrid', () => ({
  default: (props: any) => {
    return (
      <div data-testid="custom-data-grid">
        <div data-testid="grid-headers">
          {props.columns.map((col: any, idx: number) => (
            <div key={idx} data-testid={`header-${col.field}`}>
              {col.headerName}
            </div>
          ))}
        </div>
        <div data-testid="grid-rows">
          {props.rows.map((row: any) => (
            <div
              key={props.getRowId(row)}
              data-testid={`row-${props.getRowId(row)}`}
            >
              {props.columns.map((col: any, colIdx: number) => (
                <div
                  key={colIdx}
                  data-testid={`cell-${props.getRowId(row)}-${col.field}`}
                >
                  {col.field === 'action' && col.renderCell
                    ? col.renderCell({ row })
                    : row[col.field]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}));

describe('OperatorDetailDataGrid', () => {
  const mockOnDelete = vi.fn();
  const operatorName = 'Test Operator';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleData = {
    content: [
      {
        debtPositionTypeOrgId: 1,
        organizationId: 10,
        debtPositionTypeId: 100,
        code: 'CODE1',
        debtPositionTypeDescription: 'Debt Desc 1',
        description: 'Description 1'
      },
      {
        debtPositionTypeOrgId: 2,
        organizationId: 11,
        debtPositionTypeId: 101,
        code: 'CODE2',
        debtPositionTypeDescription: 'Debt Desc 2',
        description: 'Description 2'
      }
    ],
    totalPages: 2
  } as PagedDebtPositionTypeOrgDTO;

  it('renders column headers correctly', () => {
    render(
      <OperatorDetailDataGrid
        data={sampleData}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    expect(screen.getByTestId('header-code')).toHaveTextContent(
      'OperatorDetail.code'
    );
    expect(
      screen.getByTestId('header-debtPositionTypeDescription')
    ).toHaveTextContent('OperatorDetail.debtPositionTypeDescription');
    expect(screen.getByTestId('header-description')).toHaveTextContent(
      'commons.description'
    );
    expect(screen.getByTestId('header-action')).toHaveTextContent('');
  });

  it('renders rows correctly', () => {
    render(
      <OperatorDetailDataGrid
        isSameOrg={true}
        data={sampleData}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    sampleData.content.forEach((row) => {
      expect(
        screen.getByTestId(`cell-${row.debtPositionTypeOrgId}-code`)
      ).toHaveTextContent(row.code);
      expect(
        screen.getByTestId(
          `cell-${row.debtPositionTypeOrgId}-debtPositionTypeDescription`
        )
      ).toHaveTextContent(row.debtPositionTypeDescription as string);
      expect(
        screen.getByTestId(`cell-${row.debtPositionTypeOrgId}-description`)
      ).toHaveTextContent(row.description);

      // action menu is rendered
      expect(
        screen.getByTestId(`grid-action-menu-${row.debtPositionTypeOrgId}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`delete-button-${row.debtPositionTypeOrgId}`)
      ).toBeInTheDocument();
    });
  });

  it('renders EmptyDetailContainer with correct description when no data', () => {
    render(
      <OperatorDetailDataGrid
        data={{
          content: [],
          totalPages: 0,
          size: 10,
          totalElements: 0,
          number: 0
        }}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    expect(screen.getByTestId('empty-detail-container')).toHaveTextContent(
      'OperatorDetail.emptyData'
    );
  });

  it('renders EmptyDetailContainer when data is undefined', () => {
    render(
      <OperatorDetailDataGrid
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('grid-rows')).toBeInTheDocument();
  });

  it('opens delete dialog when delete button is clicked', () => {
    render(
      <OperatorDetailDataGrid
        data={sampleData}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    expect(utils.dialog.open).toHaveBeenCalledWith({
      ['data-testid']: 'delete-dialog',
      title: 'OperatorDetail.deleteDialog.title',
      message: expect.any(Object), // Trans component
      confirmLabel: 'commons.onlyRemove',
      cancelLabel: 'commons.close',
      onConfirm: expect.any(Function),
      onClose: expect.any(Function)
    });
  });

  it('calls onDelete and closes dialog when delete is confirmed', () => {
    render(
      <OperatorDetailDataGrid
        data={sampleData}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    // Get the onConfirm function from the dialog.open call
    const dialogOpenCall = (utils.dialog.open as any).mock.calls[0][0];
    const onConfirm = dialogOpenCall.onConfirm;

    // confirming the deletion
    onConfirm();

    expect(mockOnDelete).toHaveBeenCalledWith(sampleData.content[0]);
    expect(utils.dialog.close).toHaveBeenCalled();
  });

  it('closes dialog when delete is cancelled', () => {
    render(
      <OperatorDetailDataGrid
        data={sampleData}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    // Get the onClose function from the dialog.open call
    const dialogOpenCall = (utils.dialog.open as any).mock.calls[0][0];
    const onClose = dialogOpenCall.onClose;

    // cancelling the deletion
    onClose();

    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(utils.dialog.close).toHaveBeenCalled();
  });

  it('uses correct getRowId for rows', () => {
    render(
      <OperatorDetailDataGrid
        data={sampleData}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    // rows are rendered with correct IDs
    expect(screen.getByTestId('row-1')).toBeInTheDocument(); // debtPositionTypeOrgId
    expect(screen.getByTestId('row-2')).toBeInTheDocument();
  });

  it('handles rows without debtPositionTypeOrgId correctly', () => {
    const dataWithoutId = {
      content: [
        {
          organizationId: 10,
          debtPositionTypeId: 100,
          code: 'CODE1',
          debtPositionTypeDescription: 'Debt Desc 1',
          description: 'Description 1'
        }
      ],
      totalPages: 1
    } as PagedDebtPositionTypeOrgDTO;

    render(
      <OperatorDetailDataGrid
        data={dataWithoutId}
        onDelete={mockOnDelete}
        operatorName={operatorName}
      />
    );

    // Should use fallback ID format: organizationId-debtPositionTypeId
    expect(screen.getByTestId('row-10-100')).toBeInTheDocument();
  });
});
