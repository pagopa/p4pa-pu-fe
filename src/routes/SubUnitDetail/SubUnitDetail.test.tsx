import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { render, screen } from '../../__tests__/renderers';
import { generatePath, useNavigate, useParams } from 'react-router';

import utils from '@core/utils';
import {
  getOrgSubUnitById,
  getOrgSubUnitOperators,
  updateOrgSubUnitStatus
} from '@core/api/orgSubUnit';
import { useSearch } from '@core/hooks/useSearch';
import { appState } from '@core/store/AppStateStore';
import { PageRoutes } from '..';
import { SubUnitDetail } from '.';

vi.mock('@core/api/orgSubUnit', () => ({
  updateOrgSubUnitStatus: vi.fn(),
  getOrgSubUnitById: vi.fn(),
  getOrgSubUnitOperators: vi.fn()
}));

vi.mock('@core/hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({
    title,
    chip,
    callToAction
  }: {
    title: string;
    chip?: { label: string; color: string };
    callToAction?: Array<{
      buttonText: string;
      color?: string;
      onActionClick: () => void;
    }>;
  }) => (
    <div>
      <h1>{title}</h1>
      {chip && (
        <span data-testid="status-chip" data-color={chip.color}>
          {chip.label}
        </span>
      )}
      {callToAction?.map((action) => (
        <button
          key={action.buttonText}
          data-color={action.color}
          onClick={action.onActionClick}
        >
          {action.buttonText}
        </button>
      ))}
    </div>
  )
}));

vi.mock('@core/components/GenericDialog/GenericDialog', () => ({
  default: ({
    open,
    onConfirm,
    onClose,
    confirmLabel,
    cancelLabel
  }: {
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
    confirmLabel: string;
    cancelLabel: string;
  }) =>
    open ? (
      <div data-testid="status-dialog">
        <button data-testid="confirm-status-change" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button data-testid="cancel-status-change" onClick={onClose}>
          {cancelLabel}
        </button>
      </div>
    ) : null
}));

vi.mock('./components/SubUnitSummary', () => ({
  SubUnitSummary: ({ subUnitCode }: { subUnitCode?: string }) => (
    <div data-testid="sub-unit-summary">{subUnitCode}</div>
  )
}));

vi.mock('./components/SubUnitOperatorsDataGrid', () => ({
  SubUnitOperatorsDataGrid: ({
    data,
    onDelete
  }: {
    data: unknown;
    onDelete: () => void;
  }) => (
    <div>
      <span data-testid="operators-data">{JSON.stringify(data ?? null)}</span>
      <button data-testid="delete-operator" onClick={onDelete}>
        delete
      </button>
    </div>
  )
}));

const mockNavigate = vi.fn();
const mockApplyFilters = vi.fn();
const mockMutateAsync = vi.fn();
const mockRefetch = vi.fn();

describe('SubUnitDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '';
    appState.value = {
      loading: false,
      customBreadcrumbsItems: [],
      ready: false
    };

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({
      organizationId: '33',
      subUnitCode: 'SU1'
    });
    vi.mocked(useSearch).mockReturnValue({
      applyFilters: mockApplyFilters
    } as unknown as ReturnType<typeof useSearch>);
    vi.mocked(updateOrgSubUnitStatus).mockReturnValue({
      mutateAsync: mockMutateAsync
    } as unknown as ReturnType<typeof updateOrgSubUnitStatus>);
    vi.mocked(getOrgSubUnitById).mockReturnValue({
      data: { status: 'ACTIVE', subUnitCode: 'SU1' },
      refetch: mockRefetch
    } as unknown as ReturnType<typeof getOrgSubUnitById>);
    vi.mocked(getOrgSubUnitOperators).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof getOrgSubUnitOperators>);
  });

  it('redirects to the error page when organizationId is not a number', () => {
    vi.mocked(useParams).mockReturnValue({
      organizationId: 'abc',
      subUnitCode: 'SU1'
    });

    render(<SubUnitDetail />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('redirects to the error page when subUnitCode is missing from the URL', () => {
    vi.mocked(useParams).mockReturnValue({
      organizationId: '33',
      subUnitCode: undefined
    });

    render(<SubUnitDetail />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('loads sub unit detail and operators using the URL params', () => {
    render(<SubUnitDetail />);

    expect(getOrgSubUnitById).toHaveBeenCalledWith(33, 'SU1');
    expect(getOrgSubUnitOperators).toHaveBeenCalledWith(33, 'SU1');
    expect(updateOrgSubUnitStatus).toHaveBeenCalledWith(33, 'SU1');
  });

  it.each([
    ['ACTIVE', 'default'],
    ['CANCELLED', 'neutral']
  ])('maps status %s to chip color %s', (status, color) => {
    vi.mocked(getOrgSubUnitById).mockReturnValue({
      data: { status },
      refetch: mockRefetch
    } as unknown as ReturnType<typeof getOrgSubUnitById>);

    render(<SubUnitDetail />);

    expect(screen.getByTestId('status-chip')).toHaveAttribute(
      'data-color',
      color
    );
  });

  it('renders the operators grid with the query data', () => {
    const operatorsData = { content: [{ id: 1 }], totalPages: 1 };
    vi.mocked(getOrgSubUnitOperators).mockReturnValue({
      data: operatorsData
    } as unknown as ReturnType<typeof getOrgSubUnitOperators>);

    render(<SubUnitDetail />);

    expect(screen.getByTestId('operators-data')).toHaveTextContent(
      JSON.stringify(operatorsData)
    );
  });

  it('sets breadcrumbs for organization, sub-units list, and this sub unit', () => {
    render(<SubUnitDetail />);

    expect(appState.value.customBreadcrumbsItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ORGANIZATIONS' }),
        expect.objectContaining({
          id: 'ORGANIZATIONS_DETAIL',
          pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
            organizationId: 33
          }),
          label: '33'
        }),
        expect.objectContaining({
          id: 'SUBUNITS_LIST',
          pathname: generatePath(PageRoutes.ORGANIZATIONS_SUB_UNITS, {
            organizationId: 33
          })
        }),
        expect.objectContaining({ id: 'SUB_UNIT_DETAIL', label: 'SU1' })
      ])
    );
  });

  it('disables an ACTIVE sub unit (-> CANCELLED), refetches, and reapplies filters on confirm', async () => {
    mockMutateAsync.mockResolvedValue({});
    render(<SubUnitDetail />);

    const action = screen.getByText('subunits.detail.disable.action');
    expect(action).toHaveAttribute('data-color', 'error');
    fireEvent.click(action);
    fireEvent.click(screen.getByTestId('confirm-status-change'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('CANCELLED');
      expect(mockRefetch).toHaveBeenCalled();
      expect(mockApplyFilters).toHaveBeenCalledWith({});
    });
    expect(screen.queryByTestId('status-dialog')).not.toBeInTheDocument();
  });

  it('enables a non-ACTIVE sub unit (-> ACTIVE), refetches, and reapplies filters on confirm', async () => {
    vi.mocked(getOrgSubUnitById).mockReturnValue({
      data: { status: 'CANCELLED', subUnitCode: 'SU1' },
      refetch: mockRefetch
    } as unknown as ReturnType<typeof getOrgSubUnitById>);
    mockMutateAsync.mockResolvedValue({});

    render(<SubUnitDetail />);

    const action = screen.getByText('subunits.detail.enable.action');
    expect(action).toHaveAttribute('data-color', 'primary');
    fireEvent.click(action);
    fireEvent.click(screen.getByTestId('confirm-status-change'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('ACTIVE');
      expect(mockRefetch).toHaveBeenCalled();
      expect(mockApplyFilters).toHaveBeenCalledWith({});
    });
  });

  it('notifies on error when the status update fails, but still closes the dialog and reapplies filters', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    render(<SubUnitDetail />);

    fireEvent.click(screen.getByText('subunits.detail.disable.action'));
    fireEvent.click(screen.getByTestId('confirm-status-change'));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('errors.generic');
      expect(mockApplyFilters).toHaveBeenCalledWith({});
    });
    expect(screen.queryByTestId('status-dialog')).not.toBeInTheDocument();
  });

  it('reapplies filters when an operator is deleted', () => {
    render(<SubUnitDetail />);

    fireEvent.click(screen.getByTestId('delete-operator'));

    expect(mockApplyFilters).toHaveBeenCalledWith({});
  });
});
