import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useParams } from 'react-router';
import userEvent from '@testing-library/user-event';

import { render, screen } from '@core/__tests__/renderers';
import { getOrgSubUnitsPdndServices } from '@core/api/integrations';
import { useSearch } from '@core/hooks/useSearch';

import { SubUnitIntegrations } from './SubUnitIntegrations';

vi.mock('@core/api/integrations', () => ({
  getOrgSubUnitsPdndServices: vi.fn()
}));

vi.mock('@core/hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useParams: vi.fn()
  };
});

type Column = {
  field: string;
  headerName?: string;
  renderCell?: (params: {
    row: Record<string, unknown>;
    value: unknown;
  }) => React.ReactNode;
};

vi.mock('@core/components/DataGrid/CustomDataGrid', () => ({
  default: ({
    rows,
    columns
  }: {
    rows: Array<Record<string, unknown>>;
    columns: Array<Column>;
  }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.field}>{column.headerName}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, index) => (
          <tr key={String(row.purposeId ?? row.clientId ?? index)}>
            {columns.map((column) => (
              <td key={column.field}>
                {column.renderCell
                  ? column.renderCell({
                      row,
                      value: row[column.field]
                    })
                  : (row[column.field] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

// Keep the real COMPONENT_TYPE export.
vi.mock('@core/components/FilterContainer/FilterContainer', async () => {
  const actual = await vi.importActual<
    typeof import('@core/components/FilterContainer/FilterContainer')
  >('@core/components/FilterContainer/FilterContainer');

  return {
    ...actual,
    default: ({
      values,
      onChange,
      onSubmit
    }: {
      values: Record<string, unknown>;
      onChange: (id: string, value: unknown) => void;
      onSubmit: () => void;
    }) => (
      <div>
        <span data-testid="filter-values">{JSON.stringify(values)}</span>

        <button
          data-testid="change-filter"
          onClick={() => onChange('subUnitCode', 'SU1')}
        >
          change
        </button>

        <button data-testid="submit-filters" onClick={onSubmit}>
          submit
        </button>
      </div>
    )
  };
});

// Match the component's actual import: ../Dialogs/ServiceDialog
vi.mock('../Dialogs/ServiceDialog', () => ({
  PdndSendServiceDialog: ({
    service,
    organizationId,
    onClose,
    onDelete
  }: {
    service: { purposeId?: string };
    organizationId: number;
    onClose: () => void;
    onDelete: () => void;
  }) => (
    <div
      data-testid="service-dialog"
      data-purpose-id={service.purposeId}
      data-organization-id={organizationId}
    >
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>

      <button data-testid="delete-service" onClick={onDelete}>
        delete
      </button>
    </div>
  )
}));

const mockApplyFilters = vi.fn();

const service = {
  subUnitCode: 'SU1',
  subUnitName: 'Sub Unit',
  serviceType: 'SEND',
  clientId: 'client-a',
  purposeId: 'purp_1'
};

const mockServices = (content: Array<unknown>) =>
  vi.mocked(getOrgSubUnitsPdndServices).mockReturnValue({
    data: { content }
  } as unknown as ReturnType<typeof getOrgSubUnitsPdndServices>);

describe('SubUnitIntegrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParams).mockReturnValue({
      organizationId: '33'
    });

    vi.mocked(useSearch).mockReturnValue({
      applyFilters: mockApplyFilters
    } as unknown as ReturnType<typeof useSearch>);

    mockServices([service]);
  });

  it('requests the services for the numeric organizationId', () => {
    render(<SubUnitIntegrations />);

    expect(getOrgSubUnitsPdndServices).toHaveBeenCalledWith(33);
  });

  it('renders the grid headers and service rows', () => {
    render(<SubUnitIntegrations />);

    [
      'organizations.integrations.subUnit',
      'organizations.integrations.subUnitName',
      'organizations.integrations.serviceType',
      'organizations.integrations.clientId'
    ].forEach((header) => {
      expect(
        screen.getByRole('columnheader', { name: header })
      ).toBeInTheDocument();
    });

    ['SU1', 'Sub Unit', 'SEND', 'client-a'].forEach((value) => {
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  it('renders only the header row when there are no services', () => {
    mockServices([]);

    render(<SubUnitIntegrations />);

    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('applies the edited filters on submit', async () => {
    const user = userEvent.setup();

    render(<SubUnitIntegrations />);

    await user.click(screen.getByTestId('change-filter'));

    expect(screen.getByTestId('filter-values')).toHaveTextContent(
      JSON.stringify({ subUnitCode: 'SU1' })
    );

    await user.click(screen.getByTestId('submit-filters'));

    expect(mockApplyFilters).toHaveBeenCalledWith({
      subUnitCode: 'SU1'
    });
  });

  it('opens the dialog for the selected service and closes it', async () => {
    const user = userEvent.setup();

    render(<SubUnitIntegrations />);

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /showItem/i }));

    const dialog = screen.getByTestId('service-dialog');

    expect(dialog).toHaveAttribute('data-purpose-id', 'purp_1');
    expect(dialog).toHaveAttribute('data-organization-id', '33');

    await user.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();
  });

  it('reapplies the current filters when a service is deleted', async () => {
    const user = userEvent.setup();

    render(<SubUnitIntegrations />);

    await user.click(screen.getByRole('button', { name: /showItem/i }));

    await user.click(screen.getByTestId('delete-service'));

    expect(mockApplyFilters).toHaveBeenCalledWith({});
  });
});
