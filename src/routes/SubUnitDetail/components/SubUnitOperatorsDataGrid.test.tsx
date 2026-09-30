import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SubUnitOperatorsDataGrid } from './SubUnitOperatorsDataGrid';
import {
  OrgSubUnitOperator,
  PagedOrgSubUnitOperators
} from '@generated/core/data-contracts';
import utils from '@core/utils';
import { deleteSingleOperatorFromOrgSubUnit } from '@core/api/orgSubUnit';

const mockMutateAsync = vi.fn();
vi.mock('@core/api/orgSubUnit', () => ({
  deleteSingleOperatorFromOrgSubUnit: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('@core/components/ActionMenu/ActionMenu', () => ({
  default: ({
    rowId,
    menuItems
  }: {
    rowId: string;
    menuItems: Array<{ action: () => void }>;
  }) => (
    <button
      data-testid={`delete-action-${rowId}`}
      onClick={() => menuItems[0]?.action()}
    >
      delete
    </button>
  )
}));

vi.mock('@core/components/GenericDialog/GenericDialog', () => ({
  default: ({
    open,
    onConfirm,
    onClose
  }: {
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="delete-dialog">
        <button data-testid="confirm-delete" onClick={onConfirm}>
          confirm
        </button>
        <button data-testid="cancel-delete" onClick={onClose}>
          cancel
        </button>
      </div>
    ) : null
}));

vi.mock('@core/components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns,
    getRowId,
    totalPages
  }: {
    rows: Array<OrgSubUnitOperator>;
    columns: Array<{
      field: string;
      renderCell?: (params: { row: OrgSubUnitOperator }) => React.ReactNode;
    }>;
    getRowId: (row: OrgSubUnitOperator) => string;
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
                : (row[col.field as keyof OrgSubUnitOperator] as string)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}));

const operatorWithName = {
  mappedExternalUserId: 'U1',
  firstName: 'Mario',
  lastName: 'Rossi',
  fiscalCode: 'MRIRSS80A01H501U'
} as OrgSubUnitOperator;

const operatorWithoutName = {
  mappedExternalUserId: 'U2'
} as OrgSubUnitOperator;

const renderGrid = (content: Array<OrgSubUnitOperator>, onDelete = vi.fn()) =>
  render(
    <SubUnitOperatorsDataGrid
      data={{ content } as PagedOrgSubUnitOperators}
      organizationId={33}
      subUnitCode="SU1"
      onDelete={onDelete}
    />
  );

describe('SubUnitOperatorsDataGrid', () => {
  it('initializes the delete mutation with organizationId and subUnitCode', () => {
    renderGrid([]);

    expect(deleteSingleOperatorFromOrgSubUnit).toHaveBeenCalledWith(33, 'SU1');
  });

  it('falls back to an empty rows array and 0 total pages when data has no content', () => {
    render(
      <SubUnitOperatorsDataGrid
        data={{} as PagedOrgSubUnitOperators}
        organizationId={33}
        subUnitCode="SU1"
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('row-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('0');
  });

  it('renders the operator name, or a placeholder when both names are missing', () => {
    renderGrid([operatorWithName, operatorWithoutName]);

    expect(screen.getByTestId('cell-operatorName-U1')).toHaveTextContent(
      'Mario Rossi'
    );
    expect(screen.getByTestId('cell-operatorName-U2')).toHaveTextContent('_');
  });

  it('deletes the selected operator and calls onDelete on success, without notifying', async () => {
    const onDelete = vi.fn();
    mockMutateAsync.mockResolvedValue({});
    vi.mocked(deleteSingleOperatorFromOrgSubUnit).mockReturnValue({
      mutateAsync: mockMutateAsync
    } as unknown as ReturnType<typeof deleteSingleOperatorFromOrgSubUnit>);
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    renderGrid([operatorWithName], onDelete);

    fireEvent.click(screen.getByTestId('delete-action-U1'));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('U1');
      expect(onDelete).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    expect(notifySpy).not.toHaveBeenCalled();
  });

  it('notifies on error when the delete fails, and still closes the dialog', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    vi.mocked(deleteSingleOperatorFromOrgSubUnit).mockReturnValue({
      mutateAsync: mockMutateAsync
    } as unknown as ReturnType<typeof deleteSingleOperatorFromOrgSubUnit>);
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    renderGrid([operatorWithName]);

    fireEvent.click(screen.getByTestId('delete-action-U1'));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('errors.generic');
    });
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });
});
