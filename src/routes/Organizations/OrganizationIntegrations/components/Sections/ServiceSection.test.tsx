import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@core/__tests__/renderers';

import { PdndServiceType, type PdndServiceView } from '@generated/core/client';
import { ServicesSection } from './ServiceSection';
import { useDeletePdndService } from '@core/api/integrations';
import notify from '@core/utils/notify';
import utils from '@core/utils';

vi.mock('@core/api/integrations', () => ({
  useDeletePdndService: vi.fn()
}));

vi.mock('@core/utils/notify', () => ({
  default: { emit: vi.fn() }
}));

vi.mock('@core/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@core/utils')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      dialog: {
        open: vi.fn(),
        close: vi.fn()
      }
    }
  };
});

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate
}));

vi.mock('../Dialogs/ServiceDialog', () => ({
  PdndSendServiceDialog: ({
    service,
    onClose,
    onEdit
  }: {
    service: PdndServiceView;
    onClose: () => void;
    onEdit: (service: PdndServiceView) => void;
  }) => (
    <div data-testid="service-dialog" data-client-id={service.clientId}>
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>
      <button data-testid="edit-service" onClick={() => onEdit(service)}>
        edit
      </button>
    </div>
  )
}));

const services = [
  {
    serviceName: 'SEND service',
    serviceType: 'SEND',
    purposeId: 'purp_1',
    clientId: 'client-a'
  },
  {
    serviceName: 'Other service',
    serviceType: 'SEND',
    clientId: 'client-b'
  }
] as Array<PdndServiceView>;

const renderSection = (list = services, onDelete = vi.fn()) =>
  render(
    <ServicesSection services={list} organizationId={33} onDelete={onDelete} />
  );

describe('ServicesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeletePdndService).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useDeletePdndService>);
    mockMutateAsync.mockResolvedValue({});
  });

  it('renders nothing when there are no services', () => {
    const { container } = renderSection([]);

    expect(
      screen.getByRole('heading', {
        name: 'pdndServices'
      })
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      container.querySelector('[data-testid="service-dialog"]')
    ).not.toBeInTheDocument();
  });

  it('renders the title and a row per service, with a placeholder for a missing purposeId', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        name: 'pdndServices'
      })
    ).toBeInTheDocument();
    ['SEND service', 'purp_1', 'client-a', 'Other service', 'client-b'].forEach(
      (value) => expect(screen.getByText(value)).toBeInTheDocument()
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('opens the dialog for the selected service, and closes it on close', () => {
    renderSection();

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[1]);
    fireEvent.click(screen.getByRole('menuitem', { name: /showItem/i }));

    const dialog = screen.getByTestId('service-dialog');
    expect(dialog).toHaveAttribute('data-client-id', 'client-b');

    fireEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('service-dialog')).not.toBeInTheDocument();
  });

  it('navigates to edit with purpose and sub-unit identifiers', () => {
    renderSection([
      {
        serviceName: 'SEND service',
        serviceType: PdndServiceType.SEND,
        purposeId: 'purp_1',
        subUnitCode: 'SU1',
        clientId: 'client-a',
        clientName: 'Client A'
      }
    ]);

    fireEvent.click(screen.getByRole('button', { name: /openMenu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /modifyItem/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('purposeId=purp_1&subUnitCode=SU1')
    );
  });

  it('does not navigate when editing a service without a purpose ID', () => {
    renderSection([
      {
        serviceName: 'Other service',
        serviceType: PdndServiceType.SEND,
        clientId: 'client-b',
        clientName: 'Client B'
      }
    ]);

    fireEvent.click(screen.getByRole('button', { name: /openMenu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /modifyItem/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('opens delete confirmation and refreshes after success', async () => {
    const onDelete = vi.fn();
    vi.mocked(utils.dialog.open).mockImplementation((options) => {
      options.onConfirm?.();
    });
    renderSection(services, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        purposeId: 'purp_1'
      });
      expect(notify.emit).toHaveBeenCalledWith('commons.done', 'success');
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error notification when deletion fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('delete failed'));
    vi.mocked(utils.dialog.open).mockImplementation((options) => {
      options.onConfirm?.();
    });

    const onDelete = vi.fn();
    renderSection(services, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('errors.generic');
    });
    expect(onDelete).not.toHaveBeenCalled();
  });
});
