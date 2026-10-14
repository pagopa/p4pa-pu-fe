import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useParams } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@core/__tests__/renderers';

import { SubUnitIntegrations } from './SubUnitIntegrations';
import { getOrgSubUnitsPdndServices } from '@core/api/integrations';
import { useSearch } from '@core/hooks/useSearch';

vi.mock('@core/api/integrations', () => ({
  getOrgSubUnitsPdndServices: vi.fn()
}));

vi.mock('@core/hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useParams: vi.fn() };
});

type Column = {
  field: string;
  headerName?: string;
  renderCell?: (params: { row: unknown; value: unknown }) => React.ReactNode;
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
          {columns.map((col) => (
            <th key={col.field}>{col.headerName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col.field}>
                {col.renderCell
                  ? col.renderCell({ row, value: row[col.field] })
                  : (row[col.field] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

// Keep the real COMPONENT_TYPE export, which the component reads at render time.
vi.mock('@core/components/FilterContainer/FilterContainer', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '@core/components/FilterContainer/FilterContainer'
  );
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

vi.mock('./Dialogs/ServiceDialog', () => ({
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
    vi.mocked(useParams).mockReturnValue({ organizationId: '33' });
    vi.mocked(useSearch).mockReturnValue({
      applyFilters: mockApplyFilters
    } as unknown as ReturnType<typeof useSearch>);
    mockServices([service]);
  });

  it('requests the services for the numeric organizationId', () => {
    render(<SubUnitIntegrations />);

    expect(getOrgSubUnitsPdndServices).toHaveBeenCalledWith(33);
  });

  it('renders the grid headers and the service rows', () => {
    render(<SubUnitIntegrations />);

    [
      'organizations.integrations.subUnit',
      'organizations.integrations.subUnitName',
      'organizations.integrations.serviceType',
      'organizations.integrations.clientId'
    ].forEach((header) =>
      expect(
        screen.getByRole('columnheader', { name: header })
      ).toBeInTheDocument()
    );
    ['SU1', 'Sub Unit', 'SEND', 'client-a'].forEach((value) =>
      expect(screen.getByText(value)).toBeInTheDocument()
    );
  });

  it('renders only the header row when there are no services', () => {
    vi.mocked(getOrgSubUnitsPdndServices).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof getOrgSubUnitsPdndServices>);

    render(<SubUnitIntegrations />);

    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('applies the edited filters on submit', async () => {
    render(<SubUnitIntegrations />);

    await userEvent.click(screen.getByTestId('change-filter'));
    await userEvent.click(screen.getByTestId('submit-filters'));

    expect(mockApplyFilters).toHaveBeenCalledWith({ subUnitCode: 'SU1' });
  });

  it('opens the dialog for the selected service and closes it on close', async () => {
    render(<SubUnitIntegrations />);

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /showItem/ }));

    const dialog = screen.getByTestId('service-dialog');
    expect(dialog).toHaveAttribute('data-purpose-id', 'purp_1');
    expect(dialog).toHaveAttribute('data-organization-id', '33');

    await userEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();
  });

  it('reapplies the filters when a service is deleted', async () => {
    render(<SubUnitIntegrations />);

    await userEvent.click(screen.getByRole('button', { name: /showItem/ }));
    await userEvent.click(screen.getByTestId('delete-service'));

    expect(mockApplyFilters).toHaveBeenCalledWith({});
  });
});
