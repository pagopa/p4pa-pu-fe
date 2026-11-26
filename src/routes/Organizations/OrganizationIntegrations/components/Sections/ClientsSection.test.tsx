import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { fireEvent, render, screen } from '@core/__tests__/renderers';

import type { PdndClientNoSecretDTO } from '@generated/core/client';

import { ClientsSection } from './ClientsSection';
import { useDeletePdndClient } from '@core/api/integrations';
import notify from '@core/utils/notify';
import utils from '@core/utils';

vi.mock('@core/api/integrations', () => ({
  useDeletePdndClient: vi.fn()
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

vi.mock('../Dialogs/ClientDialog', () => ({
  PdndClientDialog: ({
    client,
    onClose,
    onEdit
  }: {
    client: PdndClientNoSecretDTO;
    onClose: () => void;
    onEdit: (client: PdndClientNoSecretDTO) => void;
  }) => (
    <div data-testid="client-dialog" data-client-id={client.clientId}>
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>
      <button data-testid="edit-client" onClick={() => onEdit(client)}>
        edit
      </button>
    </div>
  )
}));

const clients = [
  { clientId: 'client-a', clientName: 'Client A' },
  { clientId: 'client-b', clientName: 'Client B' }
] as Array<PdndClientNoSecretDTO>;

const renderSection = (list = clients, onDelete = vi.fn()) =>
  render(
    <ClientsSection clients={list} organizationId={33} onDelete={onDelete} />
  );

describe('ClientsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeletePdndClient).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useDeletePdndClient>);
    mockMutateAsync.mockResolvedValue({});
  });

  it('renders the section title and a row per client', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        name: 'pdndClients'
      })
    ).toBeInTheDocument();

    ['Client A', 'client-a', 'Client B', 'client-b'].forEach((value) => {
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  it('renders no rows when there are no clients', () => {
    renderSection([]);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('opens the dialog for the selected client and closes it', () => {
    renderSection();

    expect(screen.queryByTestId('client-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[1]);
    fireEvent.click(screen.getByRole('menuitem', { name: /showItem/i }));

    const dialog = screen.getByTestId('client-dialog');

    expect(dialog).toHaveAttribute('data-client-id', 'client-b');

    fireEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('client-dialog')).not.toBeInTheDocument();
  });

  it('navigates to edit for the selected client', () => {
    renderSection([
      {
        clientId: 'client-a',
        clientName: 'Client A',
        subUnitCode: 'SU1',
        organizationId: 33,
        kid: 'some-kind',
        publicKey: 'some-key'
      }
    ]);

    fireEvent.click(screen.getByRole('button', { name: /openMenu/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /modifyItem/i }));
    fireEvent.click(screen.getByTestId('edit-client'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('clientId=client-a&subUnitCode=SU1')
    );
  });

  it('opens the delete confirmation and refreshes after success', async () => {
    const onDelete = vi.fn();
    vi.mocked(utils.dialog.open).mockImplementation((options) => {
      options.onConfirm?.();
    });
    renderSection(clients, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('client-a');
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
    renderSection(clients, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith('errors.generic');
    });
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('shows a specific notification with title when the client is in use (409)', async () => {
    mockMutateAsync.mockRejectedValue(
      new AxiosError('Conflict', '409', undefined, undefined, {
        status: 409,
        data: {},
        statusText: 'Conflict',
        headers: {},
        config: {
          headers: new AxiosHeaders()
        }
      })
    );
    vi.mocked(utils.dialog.open).mockImplementation((options) => {
      options.onConfirm?.();
    });

    const onDelete = vi.fn();
    renderSection(clients, onDelete);

    fireEvent.click(screen.getAllByRole('button', { name: /openMenu/i })[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /deleteItem/i }));

    await vi.waitFor(() => {
      expect(notify.emit).toHaveBeenCalledWith(
        'integrations.clientDialog.deleteError.message',
        'error',
        'integrations.clientDialog.deleteError.title'
      );
    });
    expect(notify.emit).not.toHaveBeenCalledWith('errors.generic');
    expect(onDelete).not.toHaveBeenCalled();
  });
});
