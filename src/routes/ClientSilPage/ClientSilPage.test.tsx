import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import { ClientSilPage } from './ClientSilPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useStore: () => ({
      state: { organizationId: 123 }
    })
  };
});

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: {
        content: [
          {
            clientId: 'client-1',
            clientName: 'Test Client 1',
            organizationIpaCode: 'ORG001'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        pageNo: 0,
        pageSize: 10
      },
      isPending: false
    },
    applyFilters: vi.fn(),
    setSort: vi.fn(),
    handlePaginationChange: vi.fn()
  }))
}));

vi.mock('../../hooks/useClientSilFilters', () => ({
  default: vi.fn(() => ({
    filters: [
      {
        type: 'textField',
        label: 'Nome Client SIL',
        id: 'clientName',
        gridWidth: 4
      },
      {
        type: 'textField',
        label: 'Client ID',
        id: 'clientId',
        gridWidth: 4
      },
      {
        type: 'button',
        label: 'Cerca',
        id: 'applyFilters',
        gridWidth: 2,
        onClick: vi.fn()
      }
    ]
  }))
}));

vi.mock('../../api/clientSil', () => ({
  default: {
    getClientSils: vi.fn(() => ({
      mutate: vi.fn(),
      data: null,
      isLoading: false
    }))
  }
}));

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: ({
    title,
    callToAction
  }: {
    title: string;
    callToAction?: Array<{
      onActionClick: () => void;
      buttonText: string;
    }>;
  }) => (
    <div data-testid="title-component">
      <h1>{title}</h1>
      {callToAction?.map((action, index) => (
        <button key={index} onClick={action.onActionClick}>
          {action.buttonText}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../../components/FilterContainer/FilterContainer', () => ({
  default: ({
    items,
    values,
    onChange
  }: {
    items: Array<{
      id: string;
      type: string;
      label: string;
      onClick?: () => void;
    }>;
    values: Record<string, string>;
    onChange: (id: string, value: string) => void;
  }) => (
    <div data-testid="filter-container">
      {items.map((item) => (
        <div key={item.id}>
          {item.type === 'textField' && (
            <input
              data-testid={`filter-${item.id}`}
              placeholder={item.label}
              value={values[item.id] || ''}
              onChange={(e) => onChange(item.id, e.target.value)}
            />
          )}
          {item.type === 'button' && (
            <button data-testid={`filter-${item.id}`} onClick={item.onClick}>
              {item.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}));

vi.mock('./components/ClientSilDataGrid', () => ({
  ClientSilDataGrid: ({
    data,
    loading,
    onRowClick
  }: {
    data?: {
      content?: Array<{
        clientId: string;
        clientName: string;
      }>;
    };
    loading: boolean;
    onRowClick?: (client: { clientId: string; clientName: string }) => void;
  }) => (
    <div data-testid="client-sil-data-grid">
      <div>Loading: {loading.toString()}</div>
      <div>Data count: {data?.content?.length || 0}</div>
      {data?.content?.map((client) => (
        <div
          key={client.clientId}
          data-testid={`client-row-${client.clientId}`}
          onClick={() => onRowClick?.(client)}
        >
          {client.clientName} - {client.clientId}
        </div>
      ))}
    </div>
  )
}));

describe('ClientSilPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(<ClientSilPage />);
  };

  it('should render correctly', () => {
    renderComponent();

    expect(screen.getByTestId('title-component')).toBeInTheDocument();
    expect(screen.getByTestId('filter-container')).toBeInTheDocument();
    expect(screen.getByTestId('client-sil-data-grid')).toBeInTheDocument();
  });

  it('should display correct title', () => {
    renderComponent();

    expect(screen.getByText('commons.routes.CLIENT_SIL')).toBeInTheDocument();
  });

  it('should have add new button', () => {
    renderComponent();

    const addButton = screen.getByText('clientSil.addNew');
    expect(addButton).toBeInTheDocument();
  });

  it('should handle filter changes', () => {
    renderComponent();

    const clientNameInput = screen.getByTestId('filter-clientName');
    fireEvent.change(clientNameInput, { target: { value: 'Test Client' } });

    expect(clientNameInput).toHaveValue('Test Client');
  });

  it('should display data grid with correct props', () => {
    renderComponent();

    expect(screen.getByText('Loading: false')).toBeInTheDocument();
    expect(screen.getByText('Data count: 1')).toBeInTheDocument();
  });

  it('should handle row click', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    renderComponent();

    const clientRow = screen.getByTestId('client-row-client-1');
    fireEvent.click(clientRow);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigate to client detail: client-1'
    );

    consoleSpy.mockRestore();
  });

  it('should handle add new click', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    renderComponent();

    const addButton = screen.getByText('clientSil.addNew');
    fireEvent.click(addButton);

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to create new client');

    consoleSpy.mockRestore();
  });

  it('should use correct translation keys', () => {
    renderComponent();

    expect(screen.getByText('commons.routes.CLIENT_SIL')).toBeInTheDocument();
    expect(screen.getByText('clientSil.addNew')).toBeInTheDocument();
  });
});
