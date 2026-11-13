import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generatePath, useNavigate } from 'react-router';
import { fireEvent, render, screen } from '../../../__tests__/renderers';

import OrganizationsDatagrid from './OrganizationsDatagrid';
import { PageRoutes } from '../..';
import type {
  OrganizationWithDebtPositionTypeOrgAndOperatorsCount,
  PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount
} from '../../../../generated/core/data-contracts';
import { StatusEnum } from '../../../../generated/core/data-contracts';

type Row = Record<string, unknown>;
type Action = ReactElement<{ label: string; onClick: () => void }>;
type Column = {
  field: string;
  renderCell?: (params: { value: unknown; row: Row }) => ReactElement;
  getActions?: (params: { id: unknown; row: Row }) => Array<Action>;
};

vi.mock('../../../components/DataGrid/CustomDataGrid', () => {
  const Cell = ({ col, row }: { col: Column; row: Row }) => {
    return (
      <>
        {col?.renderCell
          ? col.renderCell({ value: row[col.field], row })
          : (col.getActions?.({ id: row.organizationId, row }).map((action) => (
              <button key={action.key} onClick={action.props.onClick}>
                {action.props.label}
              </button>
            )) ?? <></>)}
      </>
    );
  };

  return {
    default: ({
      rows,
      columns,
      totalPages,
      loading
    }: {
      rows: Array<Row>;
      columns: Array<Column>;
      totalPages: number;
      loading: boolean;
    }) => (
      <div
        data-testid="grid"
        data-total-pages={totalPages}
        data-loading={String(loading)}
      >
        {rows.map((row) => (
          <div key={String(row.organizationId)} role="row">
            {columns.map((col) => (
              <Cell key={col.field} col={col} row={row} />
            ))}
          </div>
        ))}
      </div>
    )
  };
});

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

const organization = (
  organizationId: number,
  status = StatusEnum.ACTIVE
): OrganizationWithDebtPositionTypeOrgAndOperatorsCount =>
  ({
    organizationId,
    orgName: `Organization ${organizationId}`,
    orgFiscalCode: `CF00${organizationId}`,
    operatorsCount: 5,
    debtPositionTypeOrgCount: 3,
    status
  }) as OrganizationWithDebtPositionTypeOrgAndOperatorsCount;

const pagedData = (
  content = [organization(1), organization(2)],
  totalPages = 1
): PagedOrganizationWithDebtPositionTypeOrgAndOperatorsCount => ({
  content,
  totalPages,
  totalElements: content.length,
  size: 10,
  number: 0
});

const mockNavigate = vi.fn();

describe('OrganizationsDatagrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders a row per organization', () => {
    render(<OrganizationsDatagrid data={pagedData()} />);

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByTestId('grid')).toHaveAttribute('data-total-pages', '1');
    expect(screen.getByTestId('grid')).toHaveAttribute('data-loading', 'false');
  });

  it('falls back to a single page when there are no pages', () => {
    render(<OrganizationsDatagrid data={pagedData([], 0)} />);

    expect(screen.queryAllByRole('row')).toHaveLength(0);
    expect(screen.getByTestId('grid')).toHaveAttribute('data-total-pages', '1');
  });

  it('forwards the loading flag', () => {
    render(<OrganizationsDatagrid data={pagedData()} isLoading />);

    expect(screen.getByTestId('grid')).toHaveAttribute('data-loading', 'true');
  });

  it.each([
    [StatusEnum.ACTIVE, 'MuiChip-colorSuccess'],
    [StatusEnum.CANCELLED, 'MuiChip-colorDefault']
  ])('renders the %s status chip with class %s', (status, colorClass) => {
    render(
      <OrganizationsDatagrid data={pagedData([organization(1, status)])} />
    );

    expect(screen.getByTitle(`commons.status.${status}`)).toHaveClass(
      colorClass
    );
  });

  it('navigates to the organization detail when the detail action is clicked', () => {
    render(<OrganizationsDatagrid data={pagedData()} />);

    fireEvent.click(
      screen.getAllByRole('button', { name: /organizations\.detail/ })[0]
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.ORGANIZATIONS_DETAIL, { organizationId: 1 })
    );
  });
});
