import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PdndClientDialog } from './PdndClientDialog';
import { deletePdndClient } from '@core/api/integrations';
import { PdndClientNoSecretDTO } from '@generated/core/data-contracts';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { copyWithFeedback } from '@core/utils/clipboard';
import notify from '@core/utils/notify';

vi.mock('@core/api/integrations', () => ({
  deletePdndClient: vi.fn()
}));

vi.mock('@core/utils/clipboard', () => ({
  copyWithFeedback: vi.fn()
}));

vi.mock('@core/components/BaseDialog', () => ({
  BaseDialog: ({
    open,
    title,
    description,
    actions,
    children
  }: {
    open: boolean;
    title: string;
    description: string;
    actions: React.ReactNode;
    children: React.ReactNode;
  }) =>
    open ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        {actions}
      </div>
    ) : null
}));

vi.mock('@core/components/CopiableField', () => ({
  CopiableField: ({ label, value }: { label: string; value: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}));

const client = {
  clientId: 'client-a',
  clientName: 'Client A',
  kid: 'kid-1',
  publicKey: 'public-key'
} as PdndClientNoSecretDTO;

const mockMutateAsync = vi.fn();
const onClose = vi.fn();
const onDelete = vi.fn();

const renderDialog = () =>
  render(
    <PdndClientDialog
      open
      client={client}
      organizationId={33}
      onClose={onClose}
      onDelete={onDelete}
    />
  );

describe('PdndClientDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(deletePdndClient).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof deletePdndClient>);
  });

  it('renders the client name, id and kid', () => {
    renderDialog();

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('client-a')).toBeInTheDocument();
    expect(screen.getByText('kid-1')).toBeInTheDocument();
  });

  it('initializes the delete mutation with the organization and client ids', () => {
    renderDialog();

    expect(deletePdndClient).toHaveBeenCalledWith(33, 'client-a');
  });

  it('masks the public key by default and reveals it when toggled', () => {
    renderDialog();

    expect(screen.getByText(SECRET_MASK)).toBeInTheDocument();
    expect(screen.queryByText('public-key')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.show' })
    );

    expect(screen.getByText('public-key')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.hide' })
    ).toBeInTheDocument();
  });

  it('copies the public key on click', () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole('button', { name: 'integrations.apiKeyDialog.copy' })
    );

    expect(copyWithFeedback).toHaveBeenCalledWith(
      'public-key',
      'commons.copied'
    );
  });

  it('notifies, calls onDelete and closes after a successful delete', async () => {
    mockMutateAsync.mockResolvedValue({});
    const notifySpy = vi
      .spyOn(notify, 'emit')
      .mockImplementation(() => undefined);

    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'commons.delete' }));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('commons.done', 'success');
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('notifies an error and closes, without calling onDelete, when the delete fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('fail'));
    const notifySpy = vi
      .spyOn(notify, 'emit')
      .mockImplementation(() => undefined);

    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'commons.delete' }));

    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledWith('errors.generic');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('disables the delete button while the delete is pending', () => {
    vi.mocked(deletePdndClient).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    } as unknown as ReturnType<typeof deletePdndClient>);

    renderDialog();

    expect(
      screen.getByRole('button', { name: 'commons.delete' })
    ).toBeDisabled();
  });
});
