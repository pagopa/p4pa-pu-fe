import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { generatePath, useNavigate, useParams } from 'react-router';
import {
  getAssignableOrgSubUnits,
  useAddOrgSubUnitsToOperator
} from '@core/api/orgSubUnit';
import { useSearch } from '@core/hooks/useSearch';
import utils from '@core/utils';
import { PageRoutes } from '..';
import { OperatorSubunitAssign } from '.';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

vi.mock('@core/api/orgSubUnit', () => ({
  getAssignableOrgSubUnits: vi.fn(),
  useAddOrgSubUnitsToOperator: vi.fn()
}));

vi.mock('@core/hooks/useSearch', () => ({ useSearch: vi.fn() }));

vi.mock('@core/utils/dialog', () => ({
  default: { open: vi.fn(), close: vi.fn() }
}));

vi.mock('@core/utils/notify', () => ({ default: { emit: vi.fn() } }));

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({
    title,
    description
  }: {
    title: string;
    description?: string;
  }) => (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}));

vi.mock('@core/components/FilterContainer/FilterContainer', () => ({
  COMPONENT_TYPE: {
    textField: 'textField',
    select: 'select',
    button: 'button',
    dateRange: 'dateRange',
    amount: 'amount'
  },
  default: ({
    items
  }: {
    items: Array<{ label: string; onClick?: () => void }>;
  }) => (
    <div>
      {items.map((item, index) => (
        <button key={`${item.label}-${index}`} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  )
}));

vi.mock('@core/components/GridSelector', () => ({
  GridSelector: ({
    data,
    selectedIds,
    onSelectionChange
  }: {
    data: Array<{ subUnitCode: string; subUnitName: string }>;
    selectedIds: Array<string>;
    onSelectionChange: (selectedIds: Array<string>) => void;
  }) => (
    <div>
      {data.map((row) => (
        <button
          key={row.subUnitCode}
          aria-pressed={selectedIds.includes(row.subUnitCode)}
          onClick={() => onSelectionChange([row.subUnitCode])}
        >
          {row.subUnitName}
        </button>
      ))}
    </div>
  )
}));

vi.mock('@core/components/Wizard/WizardStepButtons', () => ({
  default: ({
    onBack,
    onNext,
    nextLabel
  }: {
    onBack: () => void;
    onNext: () => void;
    nextLabel: string;
  }) => (
    <div>
      <button onClick={onBack}>back</button>
      <button onClick={onNext}>{nextLabel}</button>
    </div>
  )
}));

describe('OperatorSubunitAssign', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({
      organizationId: '123',
      mappedExternalUserId: 'operator-1',
      operatorName: 'Jane Doe'
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(getAssignableOrgSubUnits).mockReturnValue(
      {} as ReturnType<typeof getAssignableOrgSubUnits>
    );
    vi.mocked(useAddOrgSubUnitsToOperator).mockReturnValue({
      mutateAsync: mockMutateAsync
    } as unknown as ReturnType<typeof useAddOrgSubUnitsToOperator>);
    vi.mocked(useSearch).mockReturnValue({
      query: {
        data: {
          content: [
            {
              subUnitCode: 'SUB-001',
              subUnitName: 'Finance Office',
              subUnitType: 'UO'
            }
          ],
          totalPages: 1
        }
      },
      applyFilters: mockApplyFilters
    } as unknown as ReturnType<typeof useSearch>);
  });

  it('renders the assign page and initializes its API hooks', () => {
    render(<OperatorSubunitAssign />);

    expect(screen.getByText('subunits.assignPage.title')).toBeInTheDocument();
    expect(screen.getByText('Finance Office')).toBeInTheDocument();
    expect(getAssignableOrgSubUnits).toHaveBeenCalledWith(123, 'operator-1');
    expect(useAddOrgSubUnitsToOperator).toHaveBeenCalledWith(123, 'operator-1');
  });

  it('applies filters and navigates back', () => {
    render(<OperatorSubunitAssign />);

    fireEvent.click(screen.getByText('commons.filters.filterResults'));
    expect(mockApplyFilters).toHaveBeenCalled();

    fireEvent.click(screen.getByText('back'));
    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.OPERATORS_DETAIL, {
        organizationId: '123',
        mappedExternalUserId: 'operator-1'
      })
    );
  });

  it('notifies when submitting without a selection', () => {
    render(<OperatorSubunitAssign />);

    fireEvent.click(screen.getByText('commons.affiliate'));

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'subunits.assignPage.dialog.noSelection'
    );
    expect(utils.dialog.open).not.toHaveBeenCalled();
  });

  it('confirms the selected sub-units and navigates on success', async () => {
    mockMutateAsync.mockResolvedValue({ success: true });
    render(<OperatorSubunitAssign />);

    fireEvent.click(screen.getByText('Finance Office'));
    fireEvent.click(screen.getByText('commons.affiliate'));

    expect(utils.dialog.open).toHaveBeenCalledWith(
      expect.objectContaining({ 'data-testid': 'operator-subunits-dialog' })
    );

    const dialog = vi.mocked(utils.dialog.open).mock.calls[0][0];
    await dialog.onConfirm?.();

    expect(mockMutateAsync).toHaveBeenCalledWith({
      orgSubUnitCodes: ['SUB-001']
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'subunits-assigned',
          i18nParams: { count: 1, operatorName: 'Jane Doe' },
          organizationId: '123',
          mappedExternalUserId: 'operator-1'
        }
      });
    });
    expect(utils.dialog.close).toHaveBeenCalled();
  });

  it('notifies when the assignment mutation fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockMutateAsync.mockRejectedValue(new Error('Assignment failed'));
    render(<OperatorSubunitAssign />);

    fireEvent.click(screen.getByText('Finance Office'));
    fireEvent.click(screen.getByText('commons.affiliate'));
    const dialog = vi.mocked(utils.dialog.open).mock.calls[0][0];
    await dialog.onConfirm?.();

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith('errors.generic');
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS);
    consoleError.mockRestore();
  });
});
