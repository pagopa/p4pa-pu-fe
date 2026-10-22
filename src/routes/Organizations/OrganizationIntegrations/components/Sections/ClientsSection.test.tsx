import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { PdndClientNoSecretDTO } from '@generated/core/client';

import { ClientsSection } from './ClientsSection';

vi.mock('../Dialogs/ClientDialog', () => ({
  PdndClientDialog: ({
    client,
    organizationId,
    onClose,
    onDelete
  }: {
    client: PdndClientNoSecretDTO;
    organizationId: number;
    onClose: () => void;
    onDelete: () => void;
  }) => (
    <div
      data-testid="client-dialog"
      data-client-id={client.clientId}
      data-organization-id={organizationId}
    >
      <button data-testid="close-dialog" onClick={onClose}>
        close
      </button>
      <button data-testid="delete-client" onClick={onDelete}>
        delete
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
  it('renders the section title and a row per client', () => {
    renderSection();

    expect(
      screen.getByRole('heading', {
        name: 'organizations.integrations.pdndClients'
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

    // Each row has a show button; select the second client's button.
    fireEvent.click(screen.getAllByRole('button')[1]);

    const dialog = screen.getByTestId('client-dialog');

    expect(dialog).toHaveAttribute('data-client-id', 'client-b');
    expect(dialog).toHaveAttribute('data-organization-id', '33');

    fireEvent.click(screen.getByTestId('close-dialog'));

    expect(screen.queryByTestId('client-dialog')).not.toBeInTheDocument();
  });

  it('forwards onDelete to the dialog', () => {
    const onDelete = vi.fn();

    renderSection(clients, onDelete);

    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByTestId('delete-client'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
