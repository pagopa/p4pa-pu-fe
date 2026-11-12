import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useParams } from 'react-router';
import userEvent from '@testing-library/user-event';

import { render, screen, within } from '@core/__tests__/renderers';
import {
  useGetOrgSubUnitsPdndClients,
  useGetOrgSubUnitsPdndServices
} from '@core/api/integrations';
import { useSearch } from '@core/hooks/useSearch';

import { SubUnitIntegrations } from './SubUnitIntegrations';

vi.mock('@core/api/integrations', () => ({
  useGetOrgSubUnitsPdndServices: vi.fn(),
  useGetOrgSubUnitsPdndClients: vi.fn()
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
    id,
    rows,
    columns,
    totalPages,
    getRowId
  }: {
    id: string;
    rows: Array<Record<string, unknown>>;
    columns: Array<Column>;
    totalPages: number;
    getRowId: (row: Record<string, unknown>) => string;
  }) => (
    <table data-testid={`grid-${id}`} data-total-pages={totalPages}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.field}>{column.headerName}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={getRowId(row)}>
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

const mockApplyServiceFilters = vi.fn();
const mockApplyClientFilters = vi.fn();

const service = {
  subUnitCode: 'SU1',
  subUnitName: 'Sub Unit',
  serviceType: 'SEND',
  clientId: 'client-a',
  purposeId: 'purp_1'
};

const client = {
  subUnitCode: 'SU2',
  subUnitName: 'Client Unit',
  clientName: 'Client Name',
  clientId: 'client-b'
};

const mockServices = (content: Array<unknown>) =>
  vi.mocked(useGetOrgSubUnitsPdndServices).mockReturnValue({
    data: { content }
  } as unknown as ReturnType<typeof useGetOrgSubUnitsPdndServices>);

const mockClients = (content: Array<unknown>) =>
  vi.mocked(useGetOrgSubUnitsPdndClients).mockReturnValue({
    data: { content }
  } as unknown as ReturnType<typeof useGetOrgSubUnitsPdndClients>);

const getSectionByHeading = (heading: string) =>
  within(
    screen
      .getByRole('heading', { name: heading })
      .closest('section') as HTMLElement
  );

const getServicesSection = () =>
  getSectionByHeading('organizations.integrations.pdndServices');

const getClientsSection = () =>
  getSectionByHeading('organizations.integrations.pdndClients');

describe('SubUnitIntegrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '';

    vi.mocked(useParams).mockReturnValue({
      organizationId: '33'
    });

    vi.mocked(useSearch).mockImplementation(
      ({ id }) =>
        ({
          applyFilters:
            id === 'se' ? mockApplyServiceFilters : mockApplyClientFilters
        }) as unknown as ReturnType<typeof useSearch>
    );

    mockServices([service]);
    mockClients([]);
  });

  it('requests the services for the numeric organizationId', () => {
    render(<SubUnitIntegrations />);

    expect(useGetOrgSubUnitsPdndServices).toHaveBeenCalledWith(33);
  });

  it('renders the grid headers and service rows', () => {
    render(<SubUnitIntegrations />);

    const section = getServicesSection();

    [
      'organizations.integrations.subUnit',
      'organizations.integrations.subUnitName',
      'organizations.integrations.serviceType',
      'organizations.integrations.clientId'
    ].forEach((header) => {
      expect(
        section.getByRole('columnheader', { name: header })
      ).toBeInTheDocument();
    });

    ['SU1', 'Sub Unit', 'SEND', 'client-a'].forEach((value) => {
      expect(section.getByText(value)).toBeInTheDocument();
    });
  });

  it('renders only the header row when there are no services', () => {
    mockServices([]);

    render(<SubUnitIntegrations />);

    expect(getServicesSection().getAllByRole('row')).toHaveLength(1);
  });

  it('applies the edited filters on submit', async () => {
    const user = userEvent.setup();

    render(<SubUnitIntegrations />);

    await user.click(screen.getByTestId('change-filter'));

    expect(screen.getByTestId('filter-values')).toHaveTextContent(
      JSON.stringify({ subUnitCode: 'SU1' })
    );

    await user.click(screen.getByTestId('submit-filters'));

    expect(mockApplyServiceFilters).toHaveBeenCalledWith({
      subUnitCode: 'SU1'
    });
    expect(mockApplyClientFilters).toHaveBeenCalledWith({
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

    expect(mockApplyServiceFilters).toHaveBeenCalledWith({});
    expect(mockApplyClientFilters).not.toHaveBeenCalled();
  });

  it('requests the clients for the numeric organizationId', () => {
    render(<SubUnitIntegrations />);

    expect(useGetOrgSubUnitsPdndClients).toHaveBeenCalledWith(33);
  });

  it('renders the clients grid headers and client rows', () => {
    mockClients([client]);

    render(<SubUnitIntegrations />);

    const section = getClientsSection();

    [
      'organizations.integrations.subUnit',
      'organizations.integrations.subUnitName',
      'organizations.integrations.clientName',
      'organizations.integrations.clientId'
    ].forEach((header) => {
      expect(
        section.getByRole('columnheader', { name: header })
      ).toBeInTheDocument();
    });

    ['SU2', 'Client Unit', 'Client Name', 'client-b'].forEach((value) => {
      expect(section.getByText(value)).toBeInTheDocument();
    });
  });

  it('renders an action button for each client row', () => {
    mockClients([client]);

    render(<SubUnitIntegrations />);

    expect(
      getClientsSection().getByRole('button', { name: /showItem/i })
    ).toBeInTheDocument();
  });

  it('renders only the header row in the clients grid when there are no clients', () => {
    render(<SubUnitIntegrations />);

    expect(getClientsSection().getAllByRole('row')).toHaveLength(1);
  });

  it('passes the response totalPages to each grid', () => {
    vi.mocked(useGetOrgSubUnitsPdndServices).mockReturnValue({
      data: { content: [service], totalPages: 3 }
    } as unknown as ReturnType<typeof useGetOrgSubUnitsPdndServices>);

    vi.mocked(useGetOrgSubUnitsPdndClients).mockReturnValue({
      data: { content: [client], totalPages: 5 }
    } as unknown as ReturnType<typeof useGetOrgSubUnitsPdndClients>);

    render(<SubUnitIntegrations />);

    expect(screen.getByTestId('grid-se')).toHaveAttribute(
      'data-total-pages',
      '3'
    );
    expect(screen.getByTestId('grid-cl')).toHaveAttribute(
      'data-total-pages',
      '5'
    );
  });

  it('renders empty grids with zero pages when the queries have no data', () => {
    vi.mocked(useGetOrgSubUnitsPdndServices).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof useGetOrgSubUnitsPdndServices>);

    vi.mocked(useGetOrgSubUnitsPdndClients).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof useGetOrgSubUnitsPdndClients>);

    render(<SubUnitIntegrations />);

    expect(getServicesSection().getAllByRole('row')).toHaveLength(1);
    expect(getClientsSection().getAllByRole('row')).toHaveLength(1);
    expect(screen.getByTestId('grid-se')).toHaveAttribute(
      'data-total-pages',
      '0'
    );
    expect(screen.getByTestId('grid-cl')).toHaveAttribute(
      'data-total-pages',
      '0'
    );
  });

  it('renders empty grids when the query results are undefined', () => {
    vi.mocked(useGetOrgSubUnitsPdndServices).mockReturnValue(
      undefined as never
    );
    vi.mocked(useGetOrgSubUnitsPdndClients).mockReturnValue(undefined as never);

    render(<SubUnitIntegrations />);

    expect(getServicesSection().getAllByRole('row')).toHaveLength(1);
    expect(getClientsSection().getAllByRole('row')).toHaveLength(1);
  });

  it('initialises the filters from the URL hash and passes them to both searches', () => {
    window.location.hash = '#subUnitCode=SU9';

    render(<SubUnitIntegrations />);

    expect(screen.getByTestId('filter-values')).toHaveTextContent(
      JSON.stringify({ subUnitCode: 'SU9' })
    );
    expect(useSearch).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'se', filters: { subUnitCode: 'SU9' } })
    );
    expect(useSearch).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cl', filters: { subUnitCode: 'SU9' } })
    );
  });
});
