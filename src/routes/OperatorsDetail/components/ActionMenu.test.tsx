import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../__tests__/renderers';
import type { DebtPositionTypeOrgDTO } from '../../../../generated/core/data-contracts';
import { GridActionMenu } from './ActionMenu';
import { PageRoutes } from '../..';
import utils from '../../../utils';

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

const openMenu = () => {
  fireEvent.click(screen.getByTestId(/action-menu-/));
};

describe('GridActionMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows only the detail action when the user cannot delete', () => {
    render(
      <GridActionMenu row={buildRow()} onDelete={vi.fn()} canDelete={false} />
    );

    openMenu();

    expect(screen.getByText('commons.goToDetail')).toBeInTheDocument();
    expect(screen.queryByText('commons.onlyRemove')).not.toBeInTheDocument();
  });

  it('navigates to the debt type organization detail', () => {
    render(
      <GridActionMenu row={buildRow()} onDelete={vi.fn()} canDelete={true} />
    );

    openMenu();
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

    openMenu();
    fireEvent.click(screen.getByText('commons.goToDetail'));

    expect(notifySpy).toHaveBeenCalledWith('errors.generic');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('invokes onDelete when the remove action is clicked', () => {
    const onDelete = vi.fn();
    const row = buildRow();
    render(<GridActionMenu row={row} onDelete={onDelete} canDelete={true} />);

    openMenu();
    fireEvent.click(screen.getByText('commons.onlyRemove'));

    expect(onDelete).toHaveBeenCalledWith(row);
  });
});
