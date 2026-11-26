import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../__tests__/renderers';
import type {
  DebtPositionTypeOrgDTO,
  OrgSubUnit
} from '../../../../generated/core/data-contracts';
import { GridActionMenu, SubUnitActionMenu } from './ActionMenu';
import { PageRoutes } from '../..';
import utils from '../../../utils';
import { generatePath } from 'react-router';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate
}));

const buildRow = (
  overrides: Partial<DebtPositionTypeOrgDTO> = {}
): DebtPositionTypeOrgDTO =>
  ({
    debtPositionTypeId: 1,
    debtPositionTypeOrgId: 99,
    ...overrides
  }) as DebtPositionTypeOrgDTO;

const openMenu = (rowId: number | string) => {
  fireEvent.click(screen.getByTestId(`action-menu-${rowId}`));
};

describe('GridActionMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows only the detail action when the user cannot delete', () => {
    render(
      <GridActionMenu row={buildRow()} onDelete={vi.fn()} canDelete={false} />
    );

    openMenu(1);

    expect(screen.getByText('commons.goToDetail')).toBeInTheDocument();
    expect(screen.queryByText('commons.onlyRemove')).not.toBeInTheDocument();
  });

  it('navigates to the debt type organization detail', () => {
    render(
      <GridActionMenu row={buildRow()} onDelete={vi.fn()} canDelete={true} />
    );

    openMenu(1);
    fireEvent.click(screen.getByText('commons.goToDetail'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(
        String(PageRoutes.DEBT_TYPE_ORG_DETAIL).split('/')[1]
      )
    );
    expect(mockNavigate.mock.calls[0][0]).toContain('99');
  });

  it('emits an error when the row has no debtPositionTypeOrgId', () => {
    const notifySpy = vi.spyOn(utils.notify, 'emit');
    render(
      <GridActionMenu
        row={buildRow({ debtPositionTypeOrgId: undefined })}
        onDelete={vi.fn()}
        canDelete={false}
      />
    );

    openMenu(1);
    fireEvent.click(screen.getByText('commons.goToDetail'));

    expect(notifySpy).toHaveBeenCalledWith('errors.generic');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('invokes onDelete when the remove action is clicked', () => {
    const onDelete = vi.fn();
    const row = buildRow();
    render(<GridActionMenu row={row} onDelete={onDelete} canDelete={true} />);

    openMenu(1);
    fireEvent.click(screen.getByText('commons.onlyRemove'));

    expect(onDelete).toHaveBeenCalledWith(row);
  });
});

describe('SubUnitActionMenu', () => {
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
  });

  const renderMenu = (onDelete = vi.fn()) =>
    render(<SubUnitActionMenu row={sampleRow} onDelete={onDelete} />);

  it('renders a detail action and a red remove action', () => {
    renderMenu();

    openMenu('SUB-001');

    expect(screen.getByText('commons.goToDetail')).toBeInTheDocument();
    expect(screen.getByText('commons.onlyRemove')).toBeInTheDocument();
    expect(screen.getByTestId('remove-detail-SUB-001')).toHaveClass(
      'MuiSvgIcon-colorError'
    );
  });

  it('navigates to the sub-unit detail with a string organization id', () => {
    renderMenu();

    openMenu('SUB-001');
    fireEvent.click(screen.getByText('commons.goToDetail'));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.SUB_UNIT_DETAIL, {
        organizationId: '123',
        subUnitCode: 'SUB-001'
      })
    );
  });

  it('calls onDelete with the selected row', () => {
    const onDelete = vi.fn();
    renderMenu(onDelete);

    openMenu('SUB-001');
    fireEvent.click(screen.getByText('commons.onlyRemove'));

    expect(onDelete).toHaveBeenCalledWith(sampleRow);
  });
});
